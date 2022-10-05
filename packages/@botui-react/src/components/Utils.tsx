import React, { useEffect, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import scrollIntoView from 'scroll-into-view-if-needed'

type SlideFadeTypes = {
  children?: JSX.Element
  visible?: boolean
  timeout?: number
}

export function SlideFade({
  children,
  timeout = 50,
  visible = true,
}: SlideFadeTypes) {
  return (
    <CSSTransition in={visible} timeout={timeout} classNames="slide-fade">
      {children}
    </CSSTransition>
  )
}

type BringIntoViewTypes = {
  children: JSX.Element
}

export function BringIntoView({ children }: BringIntoViewTypes) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (ref?.current) {
      scrollIntoView(ref.current, {
        behavior: 'smooth',
        scrollMode: 'if-needed',
      })
    }
  }, [])

  return <div ref={ref}>{children}</div>
}