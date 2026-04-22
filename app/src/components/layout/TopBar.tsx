import { useState } from 'react'
import { Sun, Moon, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UploadDialog } from '@/components/upload/UploadDialog'
import { useActiveUpload } from '@/hooks/useActiveUpload'

interface Props { theme: 'dark' | 'light'; onToggleTheme: () => void }

export function TopBar({ theme, onToggleTheme }: Props) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const { data: upload } = useActiveUpload()

  const lastUpdate = upload?.uploaded_at
    ? new Date(upload.uploaded_at).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-card)]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-[1720px] px-4 py-3 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-extrabold text-xl tracking-tight text-[var(--color-foreground)]">SellersFlow</span>
          <span className="text-[var(--color-muted-foreground)] text-sm hidden sm:inline">Monitor · Creatina Brasil</span>
        </div>

        {lastUpdate && (
          <span className="text-xs text-[var(--color-muted-foreground)] hidden lg:inline ml-1">
            Atualizado {lastUpdate}
            {upload?.track_count ? ` · ${upload.track_count} produtos` : ''}
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)}>
            <Upload size={14} />
            <span className="hidden sm:inline">Importar JSON</span>
          </Button>
          <Button size="icon" variant="ghost" onClick={onToggleTheme} aria-label="Alternar tema">
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </div>
      </div>
      <UploadDialog open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </header>
  )
}
