import { CSSTransition } from 'react-transition-group'
import scrollIntoView from 'scroll-into-view-if-needed'
import React, { createContext, Ref, useContext, useEffect, useState } from 'react'
export const RefContext = createContext<Element | HTMLElement | null>(null)

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
  const ref = useContext(RefContext) as unknown as Ref<HTMLElement | undefined>

  return (
    <CSSTransition
      nodeRef={{ current: ref as unknown as HTMLElement }}
      timeout={timeout}
      classNames="slide-fade"
      in={ref !== null && visible}
    >
      {children}
    </CSSTransition>
  )
}

type BringIntoViewTypes = {
  children: JSX.Element
  bringIntoView?: boolean
}

export function BringIntoView({
  children,
  bringIntoView = true,
}: BringIntoViewTypes) {
  const ref = useContext(RefContext)

  useEffect(() => {
    if (ref && bringIntoView) {
      scrollIntoView(ref, {
        behavior: 'smooth',
        scrollMode: 'if-needed',
      })
    }
  }, [])

  return children
}

type WithRefContextTypes = {
  as?: string
  className?: string
  children: JSX.Element
}

export function WithRefContext({
  children,
  className,
  as = 'div',
}: WithRefContextTypes) {
  const [ref, setRef] = useState<Element | null>(null)
  return React.createElement(as, {
    className: className,
    ref: (_ref) => setRef(_ref),
    children: (
      <RefContext.Provider value={ref}>{
        ref ? children: null
      }</RefContext.Provider>
    ),
  })
}