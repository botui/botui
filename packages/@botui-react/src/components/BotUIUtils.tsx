import { CSSTransition } from 'react-transition-group'
import scrollIntoView from 'scroll-into-view-if-needed'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export const RefContext = createContext<Element | HTMLElement | null>(null)

export interface SlideFadeProps {
  children?: ReactNode
  visible?: boolean
  timeout?: number
}

export function SlideFade({
  children,
  timeout = 50,
  visible = true,
}: SlideFadeProps) {
  const [nodeRef] = useState(() => React.createRef<HTMLDivElement>())

  return (
    <CSSTransition
      nodeRef={nodeRef}
      timeout={timeout}
      classNames="slide-fade"
      in={visible}
    >
      <div ref={nodeRef}>
        {children}
      </div>
    </CSSTransition>
  )
}

export interface BringIntoViewProps {
  children: ReactNode
  bringIntoView?: boolean
}

export function BringIntoView({
  children,
  bringIntoView = true,
}: BringIntoViewProps) {
  const ref = useContext(RefContext)

  useEffect(() => {
    if (ref && bringIntoView) {
      scrollIntoView(ref, {
        behavior: 'smooth',
        scrollMode: 'if-needed',
      })
    }
  }, [ref, bringIntoView])

  return <>{children}</>
}

export interface WithRefContextProps {
  as?: keyof JSX.IntrinsicElements
  className?: string
  children: ReactNode
}

export function WithRefContext({
  children,
  className,
  as = 'div',
}: WithRefContextProps) {
  const [ref, setRef] = useState<Element | null>(null)

  return React.createElement(as, {
    className: className,
    ref: (element: Element | null) => setRef(element),
    children: (
      <RefContext.Provider value={ref}>
        {ref ? children : null}
      </RefContext.Provider>
    ),
  })
}