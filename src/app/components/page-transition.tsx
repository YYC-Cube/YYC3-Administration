import { type CSSProperties, memo, type ReactNode, useEffect, useRef, useState } from 'react'

// ==========================================
// YYC³ 页面过渡动画包装器 — Phase 5 (Fixed)
// crossfade + slide 过渡，支持 key 切换
// ==========================================

interface PageTransitionProps {
  pageKey: string
  children: ReactNode
}

/**
 * Animated page transition wrapper.
 * Performs a crossfade + slide transition when `pageKey` changes.
 * Uses a two-phase approach (exit old → enter new) for smooth visual continuity.
 * Memoized with `React.memo`.
 *
 * @param pageKey - Unique key identifying the current page; triggers animation on change.
 * @param children - Page content to render with transition.
 */
export const PageTransition = memo(function PageTransition({
  pageKey,
  children,
}: PageTransitionProps) {
  const [displayedChildren, setDisplayedChildren] = useState<ReactNode>(children)
  const [phase, setPhase] = useState<'enter' | 'idle' | 'exit'>('idle')
  const prevKeyRef = useRef(pageKey)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()
  const pendingChildrenRef = useRef<ReactNode>(children)

  // Always keep latest children ref updated
  pendingChildrenRef.current = children

  useEffect(() => {
    if (pageKey !== prevKeyRef.current) {
      prevKeyRef.current = pageKey

      // Start exit phase — keep showing old content
      setPhase('exit')
      clearTimeout(timerRef.current)

      timerRef.current = setTimeout(() => {
        // Swap to new content and enter
        setDisplayedChildren(pendingChildrenRef.current)
        setPhase('enter')

        timerRef.current = setTimeout(() => setPhase('idle'), 350)
      }, 200)
    }

    return () => clearTimeout(timerRef.current)
  }, [pageKey])

  // When phase is idle and key matches, keep displayed children in sync
  useEffect(() => {
    if (phase === 'idle') {
      setDisplayedChildren(children)
    }
  }, [children, phase])

  const animStyle: CSSProperties =
    phase === 'enter'
      ? {
          animation: 'page-enter 0.35s var(--spring-easing) both',
          willChange: 'transform, opacity, filter',
        }
      : phase === 'exit'
        ? { animation: 'page-exit 0.2s ease-in both', willChange: 'transform, opacity' }
        : {}

  return (
    <div className="h-full w-full" style={animStyle}>
      {displayedChildren}
    </div>
  )
})
