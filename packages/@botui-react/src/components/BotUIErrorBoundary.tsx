import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  level?: 'ui' | 'message' | 'action'
  onError?: (error: Error, errorInfo?: any) => void
  fallback?: (error: Error, errorInfo?: any) => ReactNode
}

interface State {
  error?: Error
  errorInfo?: any
  hasError: boolean
}

export class BotUIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.setState({ errorInfo })
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    } else {
      console.error('Uncaught error in BotUI component:', error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.state.errorInfo)
      }

      return (
        <div
          className={`botui-error-boundary botui-error-${
            this.props.level || 'ui'
          }`}
        >
          <h3>Sorry, botui has encountered an error</h3>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
        </div>
      )
    }

    return this.props.children
  }
}
