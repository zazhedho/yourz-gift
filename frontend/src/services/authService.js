import api from './api'

const authService = {
  getRegisterStatus: () => api.get('/user/register/status'),
  sendRegisterOTP: (payload) => api.post('/user/register/otp/send', payload),
  login: (payload) => api.post('/user/login', payload),
  register: (payload) => api.post('/user/register', payload),
  googleLogin: (payload) => api.post('/user/google/login', payload),
  me: () => api.get('/user'),
  logout: () => api.post('/user/logout'),
}

export default authService
