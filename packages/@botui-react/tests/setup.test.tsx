import React from 'react'
import { render, screen } from '@testing-library/react'

function TestComponent() {
  return <div data-testid="test">Testing setup works!</div>
}

describe('Testing Setup', () => {
  test('should render React components', () => {
    render(<TestComponent />)
    expect(screen.getByTestId('test')).toHaveTextContent('Testing setup works!')
  })

  test('should have jest-dom matchers available', () => {
    render(<TestComponent />)
    const element = screen.getByTestId('test')
    expect(element).toBeInTheDocument()
    expect(element).toBeVisible()
  })
})