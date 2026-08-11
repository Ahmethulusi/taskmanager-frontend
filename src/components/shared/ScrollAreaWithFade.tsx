import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ScrollAreaWithFadeProps {
  children: ReactNode
  className?: string
}

export function ScrollAreaWithFade({ children, className }: ScrollAreaWithFadeProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showBottomFade, setShowBottomFade] = useState(false)

  useEffect(() => {
    const element = scrollRef.current
    if (!element) {
      return
    }

    function updateFade() {
      const node = scrollRef.current
      if (!node) {
        return
      }
      const canScroll = node.scrollHeight > node.clientHeight + 1
      const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight
      setShowBottomFade(canScroll && distanceFromBottom > 4)
    }

    updateFade()
    element.addEventListener('scroll', updateFade, { passive: true })

    const resizeObserver = new ResizeObserver(updateFade)
    resizeObserver.observe(element)

    const mutationObserver = new MutationObserver(updateFade)
    mutationObserver.observe(element, { childList: true, subtree: true, characterData: true })

    return () => {
      element.removeEventListener('scroll', updateFade)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  return (
    <div className={cn('relative min-h-0 flex-1', className)}>
      <div ref={scrollRef} className="no-scrollbar h-full overflow-y-auto">
        {children}
      </div>
      <div
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-popover to-transparent transition-opacity duration-200',
          showBottomFade ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  )
}
