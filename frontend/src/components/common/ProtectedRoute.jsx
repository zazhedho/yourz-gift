import { Navigate, Outlet, useLocation } from 'react-router-dom'

import useAuth from '../../hooks/useAuth'
import Loading from './Loading'

const ProtectedRoute = () => {
  const auth = useAuth()
  const location = useLocation()

  if (auth.booting) return <Loading label="Checking session" />
  if (!auth.isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export default ProtectedRoute
