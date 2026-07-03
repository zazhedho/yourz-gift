import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import authService from './authService'

vi.mock('./api', () => ({
  default: {
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses register status and OTP endpoints', () => {
    authService.getRegisterStatus()
    authService.sendRegisterOTP({ email: 'guest@example.com', phone: '628123456789' })

    expect(api.get).toHaveBeenCalledWith('/user/register/status')
    expect(api.post).toHaveBeenCalledWith('/user/register/otp/send', {
      email: 'guest@example.com',
      phone: '628123456789',
    })
  })

  it('uses Google login endpoint', () => {
    authService.googleLogin({ id_token: 'google-token' })

    expect(api.post).toHaveBeenCalledWith('/user/google/login', { id_token: 'google-token' })
  })

  it('uses profile and session endpoints', () => {
    authService.updateProfile({ name: 'Jane' })
    authService.listSessions()
    authService.revokeSession('session-1')
    authService.revokeOtherSessions()

    expect(api.put).toHaveBeenCalledWith('/user', { name: 'Jane' })
    expect(api.get).toHaveBeenCalledWith('/user/sessions')
    expect(api.delete).toHaveBeenCalledWith('/user/session/session-1')
    expect(api.post).toHaveBeenCalledWith('/user/sessions/revoke-others')
  })
})
