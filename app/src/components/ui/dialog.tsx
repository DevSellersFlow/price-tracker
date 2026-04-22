import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

interface DialogProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, children, className }: DialogProps) {
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative z-10 w-full max-w-lg rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-2xl', className)}>
        {children}
      </div>
    </div>,
    document.body
  )
}

export function DialogTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn('text-lg font-bold text-[var(--color-foreground)] mb-4', className)}>{children}</h2>
}
