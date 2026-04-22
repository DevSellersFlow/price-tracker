import * as React from 'react'
import { cn } from '@/lib/cn'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <select
      className={cn(
        'flex h-9 w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-input)] px-3 py-1 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </select>
  )
)
Select.displayName = 'Select'

export { Select }
