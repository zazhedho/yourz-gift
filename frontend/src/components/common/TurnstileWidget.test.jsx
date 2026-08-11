import { render, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import TurnstileWidget from './TurnstileWidget'

vi.mock('../../utils/runtimeConfig', () => ({
  getTurnstileSiteKey: () => 'site-key',
}))

describe('TurnstileWidget', () => {
  afterEach(() => {
    delete window.turnstile
  })

  it('renders explicitly and forwards the verification token', async () => {
    const onToken = vi.fn()
    window.turnstile = {
      render: vi.fn((container, options) => {
        expect(container).toBeInstanceOf(HTMLElement)
        expect(options.sitekey).toBe('site-key')
        expect(options.action).toBe('auth')
        options.callback('turnstile-token')
        return 'widget-1'
      }),
      remove: vi.fn(),
    }

    render(<TurnstileWidget action="auth" onToken={onToken} />)

    await waitFor(() => expect(onToken).toHaveBeenCalledWith('turnstile-token'))
  })
})
