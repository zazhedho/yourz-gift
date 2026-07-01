import { Navigate, Outlet } from 'react-router-dom'

import useAuth from '../../hooks/useAuth'
import Loading from './Loading'

const GuestRoute = () => {
  const auth = useAuth()

  if (auth.booting) return <Loading label="Checking session" />
  if (auth.isAuthenticated) return <Navigate to="/app/lists" replace />
  return <Outlet />
}

export default GuestRoute
