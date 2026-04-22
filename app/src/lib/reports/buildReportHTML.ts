import type { ProductRow } from '@/lib/supabase'
import { avg, uniq, brl, pct, esc, channelBadge, varCell } from './helpers'

// Adapter: report field names ← ProductRow field names
type ReportRow = ProductRow & { name: string; price_100g: number | null }

function adapt(p: ProductRow): ReportRow {
  return { ...p, name: p.display_name ?? p.title, price_100g: p.price_per_100g }
}

export function buildReportHTML(
  scopeRows: ProductRow[],
  title: string,
  subtitle: string,
  reportType: 'macro' | 'client',
): string {
  const rows = scopeRows.map(adapt)
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const mono   = rows.filter(r => r.type === 'Monohidratada')
  const avgPrice = mono.length ? avg(mono.map(r => r.price_current)) : avg(rows.map(r => r.price_current))
  const avg100g  = mono.filter(r => r.price_100g != null).length
    ? avg(mono.filter(r => r.price_100g != null).map(r => r.price_100g))
    : null
  const allVars  = rows.filter(r => r.var_pct != null && r.var_pct !== 0)
  const drops    = allVars.filter(r => (r.var_pct ?? 0) < 0).sort((a, b) => (a.var_pct ?? 0) - (b.var_pct ?? 0))
  const rises    = allVars.filter(r => (r.var_pct ?? 0) > 0).sort((a, b) => (b.var_pct ?? 0) - (a.var_pct ?? 0))
  const topDrop  = drops[0] ?? null
  const topRise  = rises[0] ?? null

  // By channel
  const byChannel = uniq(rows.map(r => r.channel)).map(c => {
    const ps = rows.filter(r => r.channel === c)
    const m  = ps.filter(r => r.price_100g != null)
    return {
      channel: c,
      avg: avg(ps.map(r => r.price_current)),
      avg100g: m.length ? avg(m.map(r => r.price_100g)) : null,
      count: ps.length,
      drops: ps.filter(r => (r.var_pct ?? 0) < -1).length,
      rises: ps.filter(r => (r.var_pct ?? 0) > 1).length,
    }
  }).sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0))

  // By brand (macro only)
  const byBrand = uniq(rows.map(r => r.brand)).map(b => {
    const ps = rows.filter(r => r.brand === b)
    const m  = ps.filter(r => r.price_100g != null)
    const topVar = ps.filter(r => r.var_pct != null).sort((a, b) => Math.abs(b.var_pct ?? 0) - Math.abs(a.var_pct ?? 0))[0] ?? null
    return {
      brand: b,
      avg: avg(ps.map(r => r.price_current)),
      avg100g: m.length ? avg(m.map(r => r.price_100g)) : null,
      count: ps.length,
      minP: Math.min(...ps.map(r => r.price_current ?? 0)),
      maxP: Math.max(...ps.map(r => r.price_current ?? 0)),
      topVar,
    }
  }).sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0))

  // ── Narrative ─────────────────────────────────────────────────────────────
  function narrative(): string {
    let txt = ''
    if (reportType === 'client') {
      const brand  = rows[0]?.brand ?? ''
      const canais = byChannel.map(c => esc(c.channel)).join(', ')
      const tamanhos = uniq(rows.map(r => r.size)).map(esc).join(', ')
      txt += `<p><strong>${esc(brand)}</strong> está presente em <strong>${byChannel.length} canal${byChannel.length > 1 ? 'is' : ''}</strong> (${canais}) com <strong>${rows.length} SKU${rows.length > 1 ? 's' : ''}</strong> distribuídos nos tamanhos: ${tamanhos}.</p>`
      if (byChannel.length > 1) {
        const best = byChannel[0], worst = byChannel[byChannel.length - 1]
        txt += `<p>Canal mais eficiente em preço: <strong>${esc(best.channel)}</strong> com média de <strong>${brl(best.avg)}</strong>. Canal mais caro: <strong>${esc(worst.channel)}</strong> com <strong>${brl(worst.avg)}</strong>. O spread entre canais é de <strong>${brl((worst.avg ?? 0) - (best.avg ?? 0))}</strong> — consumidor atento compara e migra.</p>`
      }
      if (drops.length || rises.length) {
        txt += `<p>No período analisado, ${drops.length > 0 ? `<strong>${drops.length} produto(s) tiveram queda de preço</strong> — maior: ${pct(topDrop?.var_pct)} em ${esc(topDrop?.channel)}. ` : ''}${rises.length > 0 ? `<strong>${rises.length} produto(s) subiram de preço</strong> — maior alta: ${pct(topRise?.var_pct)} em ${esc(topRise?.channel)}.` : ''}</p>`
      } else {
        txt += `<p>Preços <strong>estáveis</strong> no período monitorado — sem variações expressivas detectadas.</p>`
      }
      if (avg100g) {
        txt += `<p>Custo por 100g médio da marca: <strong>${brl(avg100g)}/100g</strong>${avg100g < 20 ? ' — posicionamento competitivo vs mercado.' : avg100g > 30 ? ' — posicionamento premium.' : ' — alinhado com a média de mercado.'}</p>`
      }
    } else {
      txt += `<p>O mercado de creatina monitora <strong>${rows.length} SKU${rows.length > 1 ? 's' : ''}</strong> de <strong>${byBrand.length} marca${byBrand.length > 1 ? 's' : ''}</strong> nos canais Amazon, Mercado Livre e Magalu.</p>`
      txt += `<p>Preço médio de Monohidratada: <strong>${brl(avgPrice)}</strong>${avg100g ? ` · R$/100g médio: <strong>${brl(avg100g)}</strong>` : ''}. A marca com menor preço médio é <strong>${esc(byBrand[0]?.brand)}</strong> (${brl(byBrand[0]?.avg)}), e a de maior preço é <strong>${esc(byBrand[byBrand.length - 1]?.brand)}</strong> (${brl(byBrand[byBrand.length - 1]?.avg)}).</p>`
      if (drops.length >= 3) {
        txt += `<p><strong>⚠️ Pressão de preços detectada:</strong> ${drops.length} produtos reduziram preço no período. Maior queda: <strong>${esc(topDrop?.brand)} ${esc(topDrop?.size)}</strong> no ${esc(topDrop?.channel)} com ${pct(topDrop?.var_pct)}. Mercado em movimento — monitorar os próximos 7 dias.</p>`
      } else if (drops.length > 0) {
        txt += `<p>Foram detectadas <strong>${drops.length} redução(ões) de preço</strong> no período. Maior queda: ${esc(topDrop?.brand)} ${esc(topDrop?.size)} no ${esc(topDrop?.channel)} com ${pct(topDrop?.var_pct)}.</p>`
      }
      if (rises.length > 0) {
        txt += `<p><strong>${rises.length} produto(s) subiram de preço</strong> — maior alta: ${esc(topRise?.brand)} ${esc(topRise?.size)} no ${esc(topRise?.channel)} com ${pct(topRise?.var_pct)}.</p>`
      }
      if (!drops.length && !rises.length) {
        txt += `<p>Mercado <strong>estável</strong> no período monitorado — sem variações expressivas detectadas.</p>`
      }
    }
    return txt
  }

  // ── CSS ───────────────────────────────────────────────────────────────────
  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',system-ui,sans-serif;background:#f0f4f9;color:#0b1929;font-size:13px;line-height:1.55;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .page{max-width:1000px;margin:0 auto;background:#fff;box-shadow:0 2px 30px rgba(11,25,41,.1)}
    .stripe{height:5px;background:linear-gradient(90deg,#0A84FF,#38A5FF 60%,#66CAFF)}
    .hdr{background:#0b1929;padding:28px 44px 24px;display:flex;justify-content:space-between;align-items:flex-start;position:relative;overflow:hidden}
    .hdr::after{content:'';position:absolute;bottom:-80px;right:-50px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(10,132,255,.12),transparent 70%)}
    .hl{position:relative;z-index:1}
    .eye{font-size:9px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.35);margin-bottom:10px;font-family:monospace}
    .htitle{font-size:26px;font-weight:800;color:#fff;line-height:1.2;margin-bottom:6px}
    .htitle em{color:#38A5FF;font-style:normal}
    .hdate{font-size:12px;color:rgba(255,255,255,.45);margin-bottom:16px}
    .hpills{display:flex;gap:8px;flex-wrap:wrap}
    .hpill{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:4px 12px;font-size:10px;font-family:monospace;color:rgba(255,255,255,.45)}
    .hpill b{color:rgba(255,255,255,.85)}
    .hbrand{font-size:11px;color:rgba(255,255,255,.4);position:relative;z-index:1;text-align:right}
    .hbrand strong{display:block;font-size:16px;color:#fff;font-weight:800;letter-spacing:-0.3px}
    .body{padding:28px 44px 36px}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}
    .kpi{border-radius:10px;padding:16px;border:1px solid #e2eaf3;background:#f7fafd;position:relative;overflow:hidden}
    .kpi::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;border-radius:2px 2px 0 0}
    .kpi.bl::before{background:linear-gradient(90deg,#0A84FF,#38A5FF)}
    .kpi.gr::before{background:linear-gradient(90deg,#30D158,#6ee7b7)}
    .kpi.gd::before{background:linear-gradient(90deg,#FFD60A,#fbbf24)}
    .kpi.re::before{background:linear-gradient(90deg,#FF453A,#fc8181)}
    .kpi.pu::before{background:linear-gradient(90deg,#BF5AF2,#d88aff)}
    .klbl{font-size:9px;text-transform:uppercase;letter-spacing:1.2px;color:#5a7a9a;font-family:monospace;margin-bottom:6px}
    .kval{font-size:22px;font-weight:800;color:#0b1929;line-height:1;margin-bottom:3px}
    .kval.green{color:#1a6b3c}.kval.red{color:#dc2626}.kval.blue{color:#1d4ed8}
    .kmeta{font-size:10px;color:#7a9db8}
    .sec{margin-bottom:26px}
    .sec-hd{display:flex;align-items:center;gap:8px;margin-bottom:12px}
    .sec-icon{font-size:14px}
    .sec-title{font-size:14px;font-weight:700;color:#0b1929}
    .sec-sub{font-size:10px;color:#7a9db8;font-family:monospace}
    .sec-rule{flex:1;height:1px;background:linear-gradient(to right,#0A84FF44,transparent);margin-left:8px}
    .narr{background:#f7fafd;border:1px solid #dde8f4;border-left:4px solid #0A84FF;border-radius:0 8px 8px 0;padding:16px 20px;font-size:13px;line-height:1.85;color:#2d4a6a}
    .narr p{margin-bottom:10px}.narr p:last-child{margin-bottom:0}
    .narr strong{color:#0b1929}
    .tbl{width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;border:1px solid #dde8f4;margin-bottom:6px}
    thead tr{background:#0b1929}
    thead th{padding:9px 13px;text-align:left;font-family:monospace;font-size:8.5px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.5);white-space:nowrap}
    tbody tr{border-bottom:1px solid #eef3f8;transition:background .1s}
    tbody tr:last-child{border-bottom:none}
    tbody tr:hover{background:#f7fafd}
    tbody tr.dn{background:#f0fdf4;border-left:3px solid #30D158}
    tbody tr.up{background:#fff5f5;border-left:3px solid #FF453A}
    td{padding:9px 13px;font-size:12px;vertical-align:middle}
    .mono{font-family:monospace;font-weight:700}
    .green{color:#1a6b3c}.red{color:#dc2626}.gray{color:#7a9db8}
    .badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:9px;font-family:monospace;font-weight:700}
    .b-amz{background:rgba(255,153,0,.1);color:#e07b00;border:1px solid rgba(255,153,0,.2)}
    .b-ml{background:rgba(200,160,0,.1);color:#9a7a00;border:1px solid rgba(200,160,0,.2)}
    .b-mg{background:rgba(0,128,255,.1);color:#0060cc;border:1px solid rgba(0,128,255,.2)}
    .b-sit{background:rgba(48,209,88,.1);color:#1a8040;border:1px solid rgba(48,209,88,.2)}
    .g2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
    .card{border:1px solid #dde8f4;border-radius:10px;overflow:hidden}
    .card-hd{background:#f7fafd;padding:9px 14px;border-bottom:1px solid #e2eaf3}
    .card-title{font-size:11px;font-weight:700;color:#0b1929;text-transform:uppercase;letter-spacing:.4px}
    .brand-row{display:flex;align-items:center;gap:10px;padding:9px 13px;border-bottom:1px solid #f0f4f8}
    .brand-row:last-child{border-bottom:none}
    .brand-rn{font-family:monospace;font-size:11px;color:#7a9db8;width:20px;text-align:right;flex-shrink:0}
    .rn1{color:#ca8a04;font-weight:700}.rn2{color:#64748b;font-weight:700}.rn3{color:#c2622e;font-weight:700}
    .brand-info{flex:1;min-width:0}
    .brand-name{font-size:12px;font-weight:600}
    .brand-meta{font-size:10px;color:#7a9db8;margin-top:1px}
    .brand-bar{height:4px;background:#e2eaf3;border-radius:2px;margin-top:4px;overflow:hidden}
    .brand-bar-f{height:100%;border-radius:2px}
    .brand-val{font-family:monospace;font-weight:700;font-size:13px;color:#1a6b3c;flex-shrink:0}
    .ch-row{display:flex;gap:10px;align-items:center;padding:8px 13px;border-bottom:1px solid #f0f4f8}
    .ch-row:last-child{border-bottom:none}
    .alert-box{background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:12px 16px;font-size:12px;color:#92400e;line-height:1.6;margin-bottom:16px}
    .foot{background:#0b1929;padding:12px 44px;display:flex;justify-content:space-between;align-items:center}
    .fl{font-size:9px;font-family:monospace;color:rgba(255,255,255,.3)}.fl b{color:rgba(255,255,255,.65)}
    .fr{font-size:9px;font-family:monospace;color:rgba(255,255,255,.2)}
    @media print{body{background:#fff}.page{box-shadow:none}.stripe,.hdr,thead tr,.kpi::before,.foot{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    @media screen and (max-width:768px){
      .page{max-width:100%!important}.hdr{padding:20px 20px 18px!important;flex-direction:column;gap:12px}
      .body{padding:16px 16px 24px!important}.kpis{grid-template-columns:repeat(2,1fr)!important;gap:8px!important}
      .g2,.g3{grid-template-columns:1fr!important}.tbl{font-size:11px!important;min-width:0!important}
      .tbl td,.tbl th{padding:6px 8px!important}.foot{padding:10px 16px!important;flex-direction:column;gap:4px}
      .narr{padding:12px 14px!important;font-size:12px!important}.hpills{gap:5px!important}
      .htitle{font-size:20px!important}.brand-row{flex-wrap:wrap}
      table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch}
    }
  `

  // ── Brand rows ─────────────────────────────────────────────────────────────
  const maxAvg = Math.max(...byBrand.map(b => b.avg ?? 0))
  const brandRows = byBrand.map(({ brand: b, avg: a, avg100g: a100, count: c, minP, maxP, topVar }, i) => {
    const pctBar = Math.round((a ?? 0) / maxAvg * 100)
    const barColor = i === 0 ? '#ca8a04' : i === 1 ? '#64748b' : i === 2 ? '#c2622e' : '#0A84FF'
    const varStr = topVar ? `${(topVar.var_pct ?? 0) < 0 ? '▼' : '▲'}${Math.abs(topVar.var_pct ?? 0).toFixed(1)}%` : ''
    return `<div class="brand-row">
      <div class="brand-rn ${i === 0 ? 'rn1' : i === 1 ? 'rn2' : i === 2 ? 'rn3' : ''}">${i + 1}</div>
      <div class="brand-info">
        <div class="brand-name">${esc(b)}</div>
        <div class="brand-meta">${c} SKU${c > 1 ? 's' : ''} · min ${brl(minP)} · max ${brl(maxP)}${a100 ? ` · R$${a100.toFixed(2)}/100g` : ''}</div>
        <div class="brand-bar"><div class="brand-bar-f" style="width:${pctBar}%;background:${barColor}"></div></div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div class="brand-val">${brl(a)}</div>
        ${varStr ? `<div style="font-family:monospace;font-size:10px;color:${(topVar?.var_pct ?? 0) < 0 ? '#1a6b3c' : '#dc2626'}">${varStr}</div>` : ''}
      </div>
    </div>`
  }).join('')

  // ── Product rows ───────────────────────────────────────────────────────────
  const prodRows = rows.map(r => {
    const hasDrop = r.var_pct != null && r.var_pct < -1
    const hasRise = r.var_pct != null && r.var_pct > 1
    return `<tr class="${hasDrop ? 'dn' : hasRise ? 'up' : ''}">
      <td style="font-weight:600;max-width:200px">${esc(r.name)}</td>
      <td>${channelBadge(r.channel)}</td>
      <td style="font-family:monospace;font-size:11px;color:#5a7a9a">${esc(r.size)}</td>
      <td><a href="${esc(r.url)}" target="_blank" style="font-family:monospace;font-weight:700;font-size:13px;color:#1a6b3c;text-decoration:none">${brl(r.price_current)}</a></td>
      <td style="font-family:monospace;font-size:11px;color:#7a9db8">${r.price_min !== r.price_max ? brl(r.price_min) + ' – ' + brl(r.price_max) : brl(r.price_min)}</td>
      <td>${varCell(r.var_pct)}</td>
      <td style="font-family:monospace;font-size:11px;color:#7a9db8">${r.price_100g ? brl(r.price_100g) + '/100g' : '—'}</td>
    </tr>`
  }).join('')

  // ── Channel rows ───────────────────────────────────────────────────────────
  const channelRows = byChannel.map(({ channel: c, avg: a, avg100g: a100, count: ct, drops: d, rises: ri }) => `
    <div class="ch-row">
      <div style="flex:1">${channelBadge(c)} <span style="font-size:12px;font-weight:600;margin-left:6px">${esc(c)}</span></div>
      <div style="font-family:monospace;font-weight:700;color:#1a6b3c;min-width:70px;text-align:right">${brl(a)}</div>
      ${a100 ? `<div style="font-family:monospace;font-size:11px;color:#7a9db8;min-width:90px;text-align:right">${brl(a100)}/100g</div>` : '<div></div>'}
      <div style="font-size:10px;color:#7a9db8;min-width:80px;text-align:right">${ct} SKU${ct > 1 ? 's' : ''}</div>
      <div style="font-size:10px;min-width:80px;text-align:right">${d > 0 ? `<span style="color:#1a6b3c">▼${d}</span> ` : ''}${ri > 0 ? `<span style="color:#dc2626">▲${ri}</span>` : ''}${!d && !ri ? '<span style="color:#7a9db8">—</span>' : ''}</div>
    </div>`).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>${css}</style>
</head>
<body>
<div class="page">
<div class="stripe"></div>
<div class="hdr">
  <div class="hl">
    <div class="eye">SellersFlow Intelligence · Monitor de Preços · Creatina Brasil</div>
    <div class="htitle">${reportType === 'client'
      ? `<em>${esc(rows[0]?.brand ?? '')}</em> — Análise de Portfólio`
      : `Mercado de <em>Creatina Brasil</em>`}
    </div>
    <div class="hdate">Gerado em ${dateStr} às ${timeStr} · ${esc(subtitle)}</div>
    <div class="hpills">
      <div class="hpill">📦 <b>${rows.length}</b> SKUs</div>
      ${reportType === 'macro' ? `<div class="hpill">🏷️ <b>${byBrand.length}</b> marcas</div>` : ''}
      <div class="hpill">🏪 ${uniq(rows.map(r => r.channel)).map(esc).join(' · ')}</div>
      ${drops.length ? `<div class="hpill">📉 <b>${drops.length}</b> queda${drops.length > 1 ? 's' : ''}</div>` : ''}
      ${rises.length ? `<div class="hpill">📈 <b>${rises.length}</b> alta${rises.length > 1 ? 's' : ''}</div>` : ''}
    </div>
  </div>
  <div class="hbrand"><span style="font-size:9px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.3)">Gerado por</span><strong>SellersFlow</strong></div>
</div>
<div style="background:#fffbeb;border:1px solid #fcd34d;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:10px 18px;margin:16px 44px 0;font-size:11px;color:#92400e;line-height:1.65">
  <strong>⚠️ Nota importante sobre os dados:</strong> Os preços monitorados correspondem aos anúncios onde a marca disputa o mercado nos marketplaces. Em plataformas como Amazon e Mercado Livre, a <strong>Buy Box</strong> pode ser conquistada por <strong>revendedores terceiros</strong>, e não necessariamente pela própria marca. O preço exibido é o do anúncio no momento da captura — e quem está vendendo pode variar. Sempre verifique o vendedor ao acessar o link.
</div>
<div class="body">

<div class="kpis" style="grid-template-columns:repeat(${reportType === 'client' ? 4 : 5},1fr)">
  <div class="kpi gr">
    <div class="klbl">Preço médio atual</div>
    <div class="kval green">${brl(avgPrice)}</div>
    <div class="kmeta">${mono.length} SKU${mono.length !== 1 ? 's' : ''} Mono</div>
  </div>
  ${avg100g != null ? `<div class="kpi bl">
    <div class="klbl">R$/100g médio</div>
    <div class="kval blue">${brl(avg100g)}</div>
    <div class="kmeta">referência commodity</div>
  </div>` : ''}
  <div class="kpi gd">
    <div class="klbl">Maior queda</div>
    <div class="kval green">${topDrop ? pct(topDrop.var_pct) : 'Estável'}</div>
    <div class="kmeta">${topDrop ? esc(topDrop.brand) + ' · ' + esc(topDrop.channel) : ''}</div>
  </div>
  <div class="kpi re">
    <div class="klbl">Maior alta</div>
    <div class="kval red">${topRise ? pct(topRise.var_pct) : 'Estável'}</div>
    <div class="kmeta">${topRise ? esc(topRise.brand) + ' · ' + esc(topRise.channel) : ''}</div>
  </div>
  <div class="kpi pu">
    <div class="klbl">Variações detectadas</div>
    <div class="kval">${allVars.length}</div>
    <div class="kmeta">${drops.length} quedas · ${rises.length} altas</div>
  </div>
</div>

${drops.length >= 3 ? `<div class="alert-box">⚠️ <strong>Alerta de mercado:</strong> ${drops.length} produtos reduziram preço no período. Possível início de pressão competitiva. Monitorar os próximos 7–10 dias antes de agir em precificação.</div>` : ''}

<div class="sec">
  <div class="sec-hd"><div class="sec-icon">📝</div><div class="sec-title">Análise Executiva</div><div class="sec-sub">gerada com base nos dados do período</div><div class="sec-rule"></div></div>
  <div class="narr">${narrative()}</div>
</div>

<div class="sec">
  <div class="sec-hd"><div class="sec-icon">🏪</div><div class="sec-title">Desempenho por Canal</div><div class="sec-sub">preço médio · variações · cobertura</div><div class="sec-rule"></div></div>
  <div class="card">${channelRows}</div>
</div>

${reportType === 'macro' ? `
<div class="sec">
  <div class="sec-hd"><div class="sec-icon">🏆</div><div class="sec-title">Ranking de Marcas — Preço Médio</div><div class="sec-sub">da mais barata à mais cara · verde = mais eficiente</div><div class="sec-rule"></div></div>
  <div class="card">${brandRows}</div>
</div>` : ''}

${(drops.length || rises.length) ? `
<div class="sec">
  <div class="sec-hd"><div class="sec-icon">📊</div><div class="sec-title">Movimentos de Preço</div><div class="sec-sub">variações detectadas no período · verde = queda · vermelho = alta</div><div class="sec-rule"></div></div>
  <div class="g2">
    <div class="card">
      <div class="card-hd"><div class="card-title">📉 Quedas (${drops.length})</div></div>
      <table class="tbl" style="border-radius:0;border:none">
        <thead><tr><th>Produto</th><th>Canal</th><th>De</th><th>Para</th><th>Var.</th></tr></thead>
        <tbody>${drops.slice(0, 8).map(r => `<tr class="dn">
          <td style="font-size:11px">${esc(r.name)}</td>
          <td>${channelBadge(r.channel)}</td>
          <td style="font-family:monospace;color:#7a9db8">${brl(r.price_initial)}</td>
          <td class="mono green">${brl(r.price_current)}</td>
          <td>${varCell(r.var_pct)}</td>
        </tr>`).join('') || '<tr><td colspan="5" style="color:#7a9db8;text-align:center;padding:16px">Sem quedas</td></tr>'}
        </tbody>
      </table>
    </div>
    <div class="card">
      <div class="card-hd"><div class="card-title">📈 Altas (${rises.length})</div></div>
      <table class="tbl" style="border-radius:0;border:none">
        <thead><tr><th>Produto</th><th>Canal</th><th>De</th><th>Para</th><th>Var.</th></tr></thead>
        <tbody>${rises.slice(0, 8).map(r => `<tr class="up">
          <td style="font-size:11px">${esc(r.name)}</td>
          <td>${channelBadge(r.channel)}</td>
          <td style="font-family:monospace;color:#7a9db8">${brl(r.price_initial)}</td>
          <td class="mono red">${brl(r.price_current)}</td>
          <td>${varCell(r.var_pct)}</td>
        </tr>`).join('') || '<tr><td colspan="5" style="color:#7a9db8;text-align:center;padding:16px">Sem altas</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>
</div>` : ''}

<div class="sec">
  <div class="sec-hd"><div class="sec-icon">📋</div><div class="sec-title">Base Completa de Produtos</div><div class="sec-sub">preço atual · mín–máx do período · variação · R$/100g</div><div class="sec-rule"></div></div>
  <table class="tbl">
    <thead><tr>
      <th>Produto</th><th>Canal</th><th>Tam.</th>
      <th>Preço atual</th><th>Mín – Máx</th><th>Var. %</th><th>R$/100g</th>
    </tr></thead>
    <tbody>${prodRows}</tbody>
  </table>
  <p style="font-size:10px;color:#7a9db8;margin-top:6px;font-family:monospace">Verde = preço caiu no período · Vermelho = preço subiu · Clique no preço para abrir o anúncio</p>
</div>

</div>
<div class="foot">
  <div class="fl">Gerado por <b>SellersFlow Intelligence</b> · Monitor Creatina Brasil · ${dateStr} às ${timeStr}</div>
  <div class="fr">🔒 Confidencial · Não distribuir sem autorização</div>
</div>
</div>
<style>
@media print {
  #pdf-bar { display: none !important; }
  body { background: white !important; margin: 0 !important; }
  .page { box-shadow: none !important; max-width: 100% !important; }
  .stripe, .hdr, thead tr, .kpi::before, .foot { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  tr { page-break-inside: avoid; }
  .sec { page-break-inside: avoid; }
  .g2 { page-break-inside: avoid; }
  @page { margin: 0; size: A4; }
}
</style>
</body></html>`
}
