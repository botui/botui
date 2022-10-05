import React, { useRef } from 'react'
import { CSSTransition } from 'react-transition-group'

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