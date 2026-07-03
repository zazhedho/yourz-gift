import api from './api'

const authService = {
  getRegisterStatus: () => api.get('/user/register/status'),
  sendRegisterOTP: (payload) => api.post('/user/register/otp/send', payload),
  login: (payload) => api.post('/user/login', payload),
  register: (payload) => api.post('/user/register', payload),
  googleLogin: (payload) => api.post('/user/google/login', payload),
  me: () => api.get('/user'),
  updateProfile: (payload) => api.put('/user', payload),
  listSessions: () => api.get('/user/sessions'),
  revokeSession: (sessionId) => api.delete(`/user/session/${sessionId}`),
  revokeOtherSessions: () => api.post('/user/sessions/revoke-others'),
  logout: () => api.post('/user/logout'),
}

export default authService
