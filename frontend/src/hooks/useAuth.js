import { useContext } from 'react'

import { AuthContext } from '../contexts/auth-context'

const useAuth = () => {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used within AuthProvider')
  return value
}

export default useAuth
