import { Gift, LogOut } from 'lucide-react'
import { Link, Outlet, useNavigate } from 'react-router-dom'

import useAuth from '../../hooks/useAuth'
import Button from './Button'

const AppShell = () => {
  const auth = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await auth.logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <Link className="brand" to="/app/lists">
          <Gift size={22} /> Yourz Gift
        </Link>
        <nav className="app-shell__nav">
          <Link to="/app/lists">Gift Lists</Link>
          <Button className="button--compact" variant="ghost" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </Button>
        </nav>
      </header>
      <main className="app-shell__main">
        <Outlet />
      </main>
    </div>
  )
}

export default AppShell
