import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import Register from './Register'
import authService from '../../services/authService'

vi.mock('../../hooks/useAuth', () => ({
  default: () => ({
    error: '',
    googleLogin: vi.fn(),
    register: vi.fn(),
  }),
}))

vi.mock('../../hooks/useRegisterStatus', () => ({
  default: () => ({
    enabled: true,
    error: '',
    loading: false,
    otp_enabled: true,
    otp_cooldown: 45,
  }),
}))

vi.mock('../../services/authService', () => ({
  default: {
    sendRegisterOTP: vi.fn(),
  },
}))

describe('Register', () => {
  beforeEach(() => {
    sessionStorage.clear()
    vi.clearAllMocks()
    authService.sendRegisterOTP.mockResolvedValue({ data: { data: { cooldown: 60 } } })
  })

  it('does not show OTP field before requesting OTP', () => {
    render(<Register />, { wrapper: MemoryRouter })

    expect(screen.getByRole('heading', { name: 'Create account' })).toBeInTheDocument()
    expect(screen.queryByLabelText('OTP code')).not.toBeInTheDocument()
  })

  it('moves to verification screen with resend cooldown after OTP request', async () => {
    render(<Register />, { wrapper: MemoryRouter })

    await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe')
    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com')
    await userEvent.type(screen.getByLabelText('Phone'), '628123456789')
    await userEvent.type(screen.getByLabelText('Password'), 'password123')
    await userEvent.click(screen.getByRole('button', { name: 'Send OTP' }))

    await waitFor(() => expect(authService.sendRegisterOTP).toHaveBeenCalledWith({
      email: 'jane@example.com',
      phone: '628123456789',
    }))
    expect(screen.getByRole('heading', { name: 'Check your email' })).toBeInTheDocument()
    expect(screen.getByLabelText('OTP code')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Resend 45s' })).toBeDisabled()
  })
})
