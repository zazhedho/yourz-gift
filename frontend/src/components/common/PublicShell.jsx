import { Gift } from 'lucide-react'
import { Outlet } from 'react-router-dom'

const PublicShell = () => (
  <div className="public-shell">
    <header className="public-shell__header">
      <div className="brand"><Gift size={22} /> Yourz Gift</div>
    </header>
    <Outlet />
  </div>
)

export default PublicShell
