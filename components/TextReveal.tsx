'use client'

import { useEffect, useRef, ReactNode } from 'react'
import type { gsap as GsapType } from 'gsap'

interface Props {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
}

export default function TextReveal({ children, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let gsap: typeof GsapType | null = null
    let targets: NodeListOf<Element> | null = null

    import('gsap').then(mod => {
      gsap = mod.gsap

      try {
        const elements = Array.from(
          el!.querySelectorAll<HTMLElement>('p, h2, h3, blockquote')
        )

        elements.forEach(target => {
          const mask = document.createElement('div')
          mask.className = 'tr-mask'
          target.parentNode!.insertBefore(mask, target)
          mask.appendChild(target)
        })

        targets = el!.querySelectorAll('.tr-mask > *')
        gsap.set(targets, { yPercent: 105, opacity: 0 })
        el!.style.opacity = '1'
      } catch {
        el!.style.opacity = '1'
      }
    }).catch(() => {
      el!.style.opacity = '1'
    })

    const observer = new IntersectionObserver(([entry]) => {
      if (!gsap || !targets) return

      if (entry.isIntersecting) {
        gsap.to(targets, {
          yPercent: 0,
          opacity: 1,
          duration: 1.4,
          stagger: 0.12,
          delay: 0.3,
          ease: 'expo.out',
          overwrite: true,
        })
      } else if (entry.boundingClientRect.top > 0) {
        gsap.to(targets, {
          yPercent: 105,
          opacity: 0,
          duration: 0.7,
          stagger: 0.06,
          ease: 'expo.in',
          overwrite: true,
        })
      }
    }, { threshold: 0, rootMargin: '0px 0px -120px 0px' })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className} style={{ ...style, opacity: 0 }}>
      {children}
    </div>
  )
}
