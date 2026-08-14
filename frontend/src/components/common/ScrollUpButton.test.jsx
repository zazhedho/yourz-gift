import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import ScrollUpButton from './ScrollUpButton'

describe('ScrollUpButton', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('shows after scrolling and returns to the top when clicked', () => {
    render(<ScrollUpButton />)
    const button = document.body.querySelector('button')

    expect(button).not.toHaveClass('is-visible')
    expect(button).toHaveAttribute('aria-hidden', 'true')
    expect(button).toHaveAttribute('tabindex', '-1')

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 450 })
    fireEvent.scroll(window)

    const visibleButton = screen.getByRole('button', { name: /scroll to top/i })
    expect(visibleButton).toHaveClass('is-visible')
    expect(visibleButton).toHaveAttribute('aria-hidden', 'false')
    expect(visibleButton).toHaveAttribute('tabindex', '0')

    fireEvent.click(visibleButton)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('avoids smooth scrolling when reduced motion is preferred', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
    render(<ScrollUpButton />)

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 450 })
    fireEvent.scroll(window)
    fireEvent.click(screen.getByRole('button', { name: /scroll to top/i }))

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })
})
