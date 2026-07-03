import { Gift, LogOut, MonitorSmartphone, Plus, Search, UserRound } from 'lucide-react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

import useAuth from '../../hooks/useAuth'

const AppShell = () => {
  const auth = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const searchRef = useRef(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const userInitial = (auth.user?.name || auth.user?.email || 'Y').charAt(0).toUpperCase()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!profileOpen) return undefined
    const close = (event) => {
      if (event.key === 'Escape' || !menuRef.current?.contains(event.target)) setProfileOpen(false)
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', close)
    return () => {
      document.removeEventListener('keydown', close)
      document.removeEventListener('pointerdown', close)
    }
  }, [profileOpen])

  useEffect(() => {
    if (!searchOpen) return undefined
    const close = (event) => {
      if (event.key === 'Escape' || !searchRef.current?.contains(event.target)) setSearchOpen(false)
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', close)
    return () => {
      document.removeEventListener('keydown', close)
      document.removeEventListener('pointerdown', close)
    }
  }, [searchOpen])

  const handleLogout = async () => {
    await auth.logout()
    navigate('/login', { replace: true })
  }

  const submitSearch = (event) => {
    event.preventDefault()
    const query = searchQuery.trim()
    setSearchOpen(false)
    navigate(query ? `/app/lists?search=${encodeURIComponent(query)}` : '/app/lists')
  }

  return (
    <div className="app-shell">
      <header className={`app-shell__header ${scrolled ? 'header-capsule' : ''}`}>
        <Link className="brand-logo" to="/app/lists" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textDecoration: 'none',
          fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
          fontSize: '26px',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: '#111827'
        }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)',
            borderRadius: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(244, 63, 94, 0.25)'
          }}>
            <Gift size={20} strokeWidth={2.5} />
          </div>
          Yourz<span style={{ fontWeight: 300, color: '#6b7280' }}>Gift</span>
        </Link>
        <nav className="app-shell__nav">
          <Link to="/app/lists">Lists</Link>
          <Link to="/app/lists?friends=1">Friends</Link>
          <Link to="/app/lists/new">Gifts</Link>
        </nav>
        <div className="app-shell__actions">
          <div className="header-search" ref={searchRef}>
            <button
              aria-expanded={searchOpen}
              aria-label="Search"
              className="icon-button"
              onClick={() => setSearchOpen((open) => !open)}
              type="button"
            >
              <Search size={22} />
            </button>
            {searchOpen ? (
              <form className="header-search__panel" onSubmit={submitSearch}>
                <Search size={17} />
                <input
                  autoFocus
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search wish lists"
                  value={searchQuery}
                />
                <button type="submit">Search</button>
              </form>
            ) : null}
          </div>
          <Link aria-label="Create list" className="icon-button" to="/app/lists/new">
            <Plus size={23} />
          </Link>
          <div className="profile-menu" ref={menuRef}>
            <button
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-label="Open profile menu"
              className="profile-button"
              onClick={() => setProfileOpen((open) => !open)}
              type="button"
            >
              {auth.user?.avatar_url ? <img alt="" src={auth.user.avatar_url} /> : <span>{userInitial}</span>}
            </button>
            {profileOpen ? (
              <div className="profile-menu__panel" role="menu">
                <Link onClick={() => setProfileOpen(false)} role="menuitem" to="/app/profile">
                  <UserRound size={17} /> My profile
                </Link>
                <Link onClick={() => setProfileOpen(false)} role="menuitem" to="/app/sessions">
                  <MonitorSmartphone size={17} /> Sessions
                </Link>
                <button onClick={handleLogout} role="menuitem" type="button">
                  <LogOut size={17} /> Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>
      <main className="app-shell__main" style={{ paddingTop: '92px' }}>
        <Outlet />
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .app-shell__header {
          position: fixed !important;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100 !important;
          transition: all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
          background: transparent !important;
          border-bottom: 1px solid transparent !important;
          border-radius: 0px !important;
          margin: 0 auto !important;
          width: 100% !important;
          max-width: 100% !important;
          will-change: transform, background, border-radius, width, max-width, box-shadow, margin;
        }
        
        .app-shell__header.header-capsule {
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          margin: 16px auto !important;
          max-width: 1200px !important;
          width: calc(100% - 32px) !important;
          border-radius: 99px !important;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0,0,0,0.05) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 1) !important;
          border: 1px solid rgba(255, 255, 255, 0.6) !important;
          min-height: 70px !important;
          padding: 0 32px !important;
        }

        @media (max-width: 768px) {
          .app-shell__header.header-capsule {
            margin: 12px auto !important;
            width: calc(100% - 24px) !important;
            padding: 0 24px !important;
            border-radius: 28px !important;
          }
        }
      `}} />
    </div>
  )
}

export default AppShell
