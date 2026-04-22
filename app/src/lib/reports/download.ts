export function downloadHTML(filename: string, html: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export async function downloadPDF(filename: string, html: string): Promise<void> {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ])

  // Render in a hidden iframe so the report CSS (1000px wide) applies cleanly
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1100px;height:10000px;border:none'
  document.body.appendChild(iframe)

  try {
    const iDoc = iframe.contentDocument!
    iDoc.open()
    iDoc.write(html)
    iDoc.close()

    await iDoc.fonts.ready

    const page = iDoc.querySelector('.page') as HTMLElement
    if (!page) throw new Error('Relatório não encontrado no documento')

    const A4_WIDTH_MM  = 210
    const A4_HEIGHT_MM = 297
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidthPx = page.offsetWidth

    // Capture each top-level .sec + header + body section separately for page breaks
    const sections = [
      iDoc.querySelector('.stripe'),
      iDoc.querySelector('.hdr'),
      iDoc.querySelector('.body > *:first-child'), // disclaimer
      ...iDoc.querySelectorAll('.body .sec'),
      iDoc.querySelector('.foot'),
    ].filter(Boolean) as HTMLElement[]

    let yMM = 0
    const scaleX = A4_WIDTH_MM / pdfWidthPx

    for (const section of sections) {
      const canvas = await html2canvas(section, { scale: 2, useCORS: true, backgroundColor: null })
      const imgData = canvas.toDataURL('image/png')
      const sectionHeightMM = section.offsetHeight * scaleX

      if (yMM + sectionHeightMM > A4_HEIGHT_MM && yMM > 0) {
        pdf.addPage()
        yMM = 0
      }

      pdf.addImage(imgData, 'PNG', 0, yMM, A4_WIDTH_MM, sectionHeightMM)
      yMM += sectionHeightMM
    }

    pdf.save(filename)
  } finally {
    document.body.removeChild(iframe)
  }
}
