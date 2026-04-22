import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useQueryClient } from '@tanstack/react-query'
import { UploadCloud, FileJson, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Dialog, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { processUpload } from './uploadProcessor'
import { cn } from '@/lib/cn'

interface Props {
  open: boolean
  onClose: () => void
}

type Phase = 'idle' | 'preview' | 'uploading' | 'done' | 'error'

interface Preview {
  file: File
  trackCount: number
  exportDate: string
  sizeKb: number
}

export function UploadDialog({ open, onClose }: Props) {
  const qc = useQueryClient()
  const [phase, setPhase] = useState<Phase>('idle')
  const [preview, setPreview] = useState<Preview | null>(null)
  const [progress, setProgress] = useState(0)
  const [progressMsg, setProgressMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [result, setResult] = useState<{ trackCount: number; warnings: number } | null>(null)

  const handleClose = () => {
    if (phase === 'uploading') return
    setPhase('idle')
    setPreview(null)
    setProgress(0)
    setErrorMsg('')
    setResult(null)
    onClose()
  }

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const tracks = Array.isArray(json.tracks) ? json.tracks.length : 0
      setPreview({
        file,
        trackCount: tracks,
        exportDate: json.exportDate ? new Date(json.exportDate).toLocaleDateString('pt-BR') : '—',
        sizeKb: Math.round(file.size / 1024),
      })
      setPhase('preview')
    } catch {
      setErrorMsg('Arquivo JSON inválido.')
      setPhase('error')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    maxFiles: 1,
    disabled: phase === 'uploading',
  })

  const startUpload = async () => {
    if (!preview) return
    setPhase('uploading')
    setProgress(0)
    try {
      const res = await processUpload(preview.file, (pct, msg) => {
        setProgress(pct)
        setProgressMsg(msg)
      })
      setResult({ trackCount: res.trackCount, warnings: res.warnings })
      setPhase('done')
      qc.invalidateQueries({ queryKey: ['active-upload'] })
      qc.invalidateQueries({ queryKey: ['products'] })
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro desconhecido')
      setPhase('error')
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} className="max-w-xl">
      <div className="flex items-center justify-between mb-4">
        <DialogTitle className="mb-0">Carregar prices.json</DialogTitle>
        {phase !== 'uploading' && (
          <button onClick={handleClose} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Drop zone */}
      {(phase === 'idle' || phase === 'preview') && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/8'
              : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/60'
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto mb-3 text-[var(--color-muted-foreground)]" size={36} />
          <p className="text-sm text-[var(--color-foreground)] font-medium">
            {isDragActive ? 'Solte o arquivo aqui' : 'Arraste o prices.json ou clique para selecionar'}
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1">Apenas arquivos .json</p>
        </div>
      )}

      {/* Preview */}
      {phase === 'preview' && preview && (
        <div className="mt-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-secondary)] p-4 space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--color-foreground)]">
            <FileJson size={16} />
            {preview.file.name}
          </div>
          <div className="text-xs text-[var(--color-muted-foreground)] space-y-0.5 pl-6">
            <div>{preview.trackCount} tracks detectados</div>
            <div>Data de exportação: {preview.exportDate}</div>
            <div>Tamanho: {preview.sizeKb} KB</div>
          </div>
        </div>
      )}

      {/* Progress */}
      {phase === 'uploading' && (
        <div className="mt-4 space-y-3">
          <div className="h-2 w-full rounded-full bg-[var(--color-secondary)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)] text-center">{progressMsg}</p>
        </div>
      )}

      {/* Done */}
      {phase === 'done' && result && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--color-success)]/30 bg-[var(--color-success)]/8 p-4">
          <CheckCircle2 size={20} className="text-[var(--color-success)] shrink-0" />
          <div className="text-sm text-[var(--color-foreground)]">
            <span className="font-semibold">{result.trackCount} produtos</span> importados com sucesso.
            {result.warnings > 0 && <span className="text-[var(--color-muted-foreground)]"> ({result.warnings} avisos)</span>}
          </div>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/8 p-4">
          <AlertCircle size={20} className="text-[var(--color-destructive)] shrink-0" />
          <p className="text-sm text-[var(--color-foreground)]">{errorMsg}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex justify-end gap-2">
        {phase === 'done' && (
          <Button onClick={handleClose}>Fechar</Button>
        )}
        {phase === 'error' && (
          <>
            <Button variant="outline" onClick={() => setPhase('idle')}>Tentar novamente</Button>
            <Button variant="outline" onClick={handleClose}>Fechar</Button>
          </>
        )}
        {phase === 'preview' && (
          <>
            <Button variant="outline" onClick={() => setPhase('idle')}>Trocar arquivo</Button>
            <Button onClick={startUpload}>Importar</Button>
          </>
        )}
      </div>
    </Dialog>
  )
}
