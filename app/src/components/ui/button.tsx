import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] hover:opacity-90',
        outline: 'border border-[var(--color-border)] bg-transparent hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]',
        ghost: 'hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]',
        destructive: 'bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)] hover:opacity-90',
        secondary: 'bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] hover:opacity-80',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
