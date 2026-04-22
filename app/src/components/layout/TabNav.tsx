import { cn } from '@/lib/cn'
import type { TabId } from '@/lib/types'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '⚡' },
  { id: 'mercado', label: 'Mercado', icon: '📋' },
  { id: 'evolucao', label: 'Evolução', icon: '📈' },
  { id: 'intraday', label: 'Hora a Hora', icon: '⏱️' },
]

interface Props {
  active: TabId
  onChange: (id: TabId) => void
}

export function TabNav({ active, onChange }: Props) {
  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-card)]/60">
      <div className="mx-auto max-w-[1720px] px-4 flex gap-1 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
              active === tab.id
                ? 'border-[var(--color-primary)] text-[var(--color-foreground)]'
                : 'border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            )}
          >
            <span className="mr-1.5">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
