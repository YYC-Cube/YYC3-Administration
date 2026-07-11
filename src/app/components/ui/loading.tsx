'use client'

import * as React from 'react'

import { cn } from './utils'
import { useThemeColors } from '../hooks/use-theme-colors'

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  fullscreen?: boolean
}

/**
 * 统一加载组件，支持不同尺寸和全屏模式
 * 使用主题颜色自动适配Cyberpunk和LiquidGlass主题
 *
 * @component
 * @param size - 加载动画尺寸（sm/md/lg）
 * @param label - 加载提示文字
 * @param fullscreen - 是否全屏遮罩
 * @example
 * ```tsx
 * <Loading />
 * <Loading size="lg" label="加载中..." />
 * <Loading fullscreen />
 * ```
 */
export function Loading({
  size = 'md',
  label,
  fullscreen = false,
  className,
  ...props
}: LoadingProps) {
  const tc = useThemeColors()

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const labelSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullscreen && 'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
        className,
      )}
      {...props}
    >
      <div
        className={cn('relative', sizeClasses[size])}
        style={{
          borderRadius: '50%',
          border: `3px solid ${tc.alpha(tc.primary, 0.2)}`,
          borderTopColor: tc.primary,
          animation: 'spin 1s linear infinite',
        }}
      />
      {label && (
        <span className={cn('text-muted-foreground', labelSizes[size])}>
          {label}
        </span>
      )}
    </div>
  )
}

/**
 * 骨架屏组件，用于内容加载占位
 *
 * @component
 * @param className - 自定义类名
 * @example
 * ```tsx
 * <Skeleton className="h-10 w-full" />
 * ```
 */
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted/30', className)}
      {...props}
    />
  )
}