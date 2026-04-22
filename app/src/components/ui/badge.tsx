import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]',
        success: 'bg-[var(--color-success)]/15 text-[var(--color-success)]',
        destructive: 'bg-[var(--color-destructive)]/15 text-[var(--color-destructive)]',
        secondary: 'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]',
        outline: 'border border-[var(--color-border)] text-[var(--color-foreground)]',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
