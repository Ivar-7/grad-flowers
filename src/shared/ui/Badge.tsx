import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../utils/cn'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'info' | 'purple'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
}

const badgeVariants: Record<BadgeVariant, string> = {
  default:
    'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  success:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  warning:
    'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
  purple:
    'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
}

export function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        badgeVariants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
