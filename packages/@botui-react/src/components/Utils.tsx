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
  console.log(ref);

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
  const ref = useContext(RefContext)

  useEffect(() => {
    if (ref?.current) {
      scrollIntoView(ref.current, {
      scrollIntoView(ref, {
        behavior: 'smooth',
        scrollMode: 'if-needed',
      })
    }
  }, [])

  return <div ref={ref}>{children}</div>

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
      <RefContext.Provider value={ref}>{children}</RefContext.Provider>
    ),
  })
}