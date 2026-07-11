/**
 * @file ui/lazy-image.tsx
 * @description YYC³ Lazy-loaded Image component with IntersectionObserver.
 *   Defers image loading until visible in viewport. Shows a skeleton
 *   placeholder while loading and handles error states gracefully.
 * @author YanYuCloudCube Team <admin@0379.email>
 * @version v1.0.0
 * @created 2026-07-11
 * @tags performance,lazy-loading,image
 */

import { ImageOff, Loader2 } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

import { cn } from './utils'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  /** Aspect ratio container class (e.g. "aspect-video") */
  aspectClass?: string
  /** Optional fallback src if main fails */
  fallbackSrc?: string
  /** Root margin for IntersectionObserver (default: '200px') */
  rootMargin?: string
}

/**
 * Image component that loads lazily when scrolled into view.
 * Uses native loading="lazy" + IntersectionObserver for maximum browser compatibility.
 * Renders a shimmering skeleton placeholder while loading.
 */
export const LazyImage = memo(function LazyImage({
  src,
  alt,
  className,
  aspectClass,
  fallbackSrc,
  rootMargin = '200px',
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Observe when the image enters viewport
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    // If IntersectionObserver is not available, load immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true)
      return
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsInView(true)
            observerRef.current?.disconnect()
          }
        }
      },
      { rootMargin },
    )

    observerRef.current.observe(el)
    return () => observerRef.current?.disconnect()
  }, [rootMargin])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
    setHasError(false)
  }, [])

  const handleError = useCallback(() => {
    if (fallbackSrc && src !== fallbackSrc) {
      // Try fallback src
      window.requestAnimationFrame(() => {
        setIsLoaded(false)
      })
    } else {
      setHasError(true)
      setIsLoaded(false)
    }
  }, [fallbackSrc, src])

  const currentSrc = hasError && fallbackSrc ? fallbackSrc : src

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', aspectClass, className)}
    >
      {/* Skeleton shimmer while loading */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            background:
              'linear-gradient(110deg, rgba(255,255,255,0.04) 8%, rgba(255,255,255,0.08) 18%, rgba(255,255,255,0.04) 33%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s linear infinite',
          }}
        >
          <Loader2 className="w-5 h-5 animate-spin text-white/20" />
        </div>
      )}

      {/* Error state */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
          <ImageOff className="w-8 h-8 mb-1" />
          <span className="text-xs">图片加载失败</span>
        </div>
      )}

      {/* Actual image — only render when in view */}
      {isInView && !hasError && (
        <img
          src={currentSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}

      {/* Shimmer animation keyframes */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0 }
          100% { background-position: 200% 0 }
        }
      `}</style>
    </div>
  )
})
