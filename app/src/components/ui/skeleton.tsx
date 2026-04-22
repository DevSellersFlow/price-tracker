import { cn } from '@/lib/cn'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[var(--color-muted)]', className)}
      {...props}
    />
  )
}

export { Skeleton }
