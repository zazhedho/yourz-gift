import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider } from './AuthProvider'
import useAuth from '../hooks/useAuth'
import authService from '../services/authService'

vi.mock('../services/authService', () => ({
  default: {
    login: vi.fn(),
    register: vi.fn(),
    me: vi.fn(),
    logout: vi.fn(),
  },
}))

const Consumer = () => {
  const auth = useAuth()
  return (
    <div>
      <p>{auth.isAuthenticated ? 'signed in' : 'guest'}</p>
      <p>{auth.error}</p>
      <button type="button" onClick={() => auth.login({ identifier: 'a@b.test', password: 'secret' })}>login</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('stores token and loads profile after login', async () => {
    authService.login.mockResolvedValue({
      data: { data: { access_token: 'token-1', refresh_token: 'refresh-1', session_id: 'session-1' } },
    })
    authService.me.mockResolvedValue({
      data: { data: { id: 'user-1', email: 'owner@example.com' } },
    })

    render(<AuthProvider><Consumer /></AuthProvider>)
    await userEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => expect(screen.getByText('signed in')).toBeInTheDocument())
    expect(localStorage.getItem('token')).toBe('token-1')
    expect(localStorage.getItem('refresh_token')).toBe('refresh-1')
    expect(localStorage.getItem('session_id')).toBe('session-1')
  })

  it('shows API error message when login fails', async () => {
    authService.login.mockRejectedValue({ response: { data: { message: 'invalid credentials' } } })

    render(<AuthProvider><Consumer /></AuthProvider>)
    await userEvent.click(screen.getByRole('button', { name: /login/i }))

    await waitFor(() => expect(screen.getByText('invalid credentials')).toBeInTheDocument())
  })
})
