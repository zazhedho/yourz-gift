import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Login from './Login'

const { login } = vi.hoisted(() => ({ login: vi.fn() }))

vi.mock('../../hooks/useAuth', () => ({
  default: () => ({
    error: '',
    googleLogin: vi.fn(),
    login,
  }),
}))

vi.mock('../../hooks/useRegisterStatus', () => ({
  default: () => ({ enabled: true }),
}))

vi.mock('../../components/common/TurnstileWidget', () => ({
  default: ({ onToken }) => <button type="button" onClick={() => onToken('turnstile-token')}>Mock Turnstile</button>,
}))

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    login.mockResolvedValue(true)
  })

  it('sends the Turnstile token with password login', async () => {
    render(<Login />, { wrapper: MemoryRouter })

    await userEvent.type(screen.getByLabelText('Email or phone'), 'jane@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'Password123!')
    await userEvent.click(screen.getByRole('button', { name: 'Mock Turnstile' }))
    await userEvent.click(screen.getByRole('button', { name: 'Login' }))

    await waitFor(() => expect(login).toHaveBeenCalledWith({
      identifier: 'jane@example.com',
      password: 'Password123!',
      turnstile_token: 'turnstile-token',
    }))
  })
})
