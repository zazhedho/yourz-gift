import {
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Gift,
  Lightbulb,
  LogOut,
  Menu,
  MonitorSmartphone,
  Plus,
  Search,
  ShoppingBag,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

import useAuth from '../../hooks/useAuth'

const AppShell = () => {
  const auth = useAuth()
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const navRef = useRef(null)
  const searchRef = useRef(null)
  const [navMenu, setNavMenu] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
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
    if (!navMenu) return undefined
    const close = (event) => {
      if (event.key === 'Escape' || !navRef.current?.contains(event.target)) setNavMenu('')
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', close)
    return () => {
      document.removeEventListener('keydown', close)
      document.removeEventListener('pointerdown', close)
    }
  }, [navMenu])

  useEffect(() => {
    if (!mobileNavOpen) return undefined
    const close = (event) => {
      if (event.key === 'Escape' || (!navRef.current?.contains(event.target) && !event.target.closest('.mobile-nav-toggle'))) {
        setMobileNavOpen(false)
        setNavMenu('')
      }
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', close)
    return () => {
      document.removeEventListener('keydown', close)
      document.removeEventListener('pointerdown', close)
    }
  }, [mobileNavOpen])

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
    navigate(query ? `/lists?search=${encodeURIComponent(query)}` : '/lists')
  }

  const openNav = (menu) => {
    setSearchOpen(false)
    setProfileOpen(false)
    setMobileNavOpen(true)
    setNavMenu((current) => (current === menu ? '' : menu))
  }

  const closeNav = () => {
    setNavMenu('')
    setMobileNavOpen(false)
  }

  const navSections = {
    lists: [
      { icon: ClipboardList, title: 'My Lists', description: 'View and manage your wish lists', to: '/lists', tone: 'green' },
      { icon: UsersRound, title: "Friends' Lists", description: 'Browse lists from your friends', to: '/lists?friends=1', tone: 'blue' },
      { icon: UserRound, title: 'Friends', description: 'Manage requests and connections', to: '/friends', tone: 'blue' },
      { icon: Lightbulb, title: 'Gift Ideas', description: 'Ideas saved for later', disabled: true, tone: 'amber' },
      { divider: true },
      { icon: Plus, title: 'Create List', description: 'Start a new wish list', to: '/lists/new', tone: 'solid-green' },
    ],
    gifts: [
      { icon: ShoppingBag, title: 'Shopping list', description: "Gifts you've reserved to buy", disabled: true, tone: 'green' },
      { icon: Check, title: 'Received', description: 'Gifts marked as received', to: '/gifts/received', tone: 'blue' },
    ],
  }

  const renderDropdown = (items) => (
    <div className="nav-dropdown" role="menu">
      {items.map((item, index) => {
        if (item.divider) return <div className="nav-dropdown__divider" key={`divider-${index}`} />
        const Icon = item.icon
        const content = (
          <>
            <span className={`nav-dropdown__icon nav-dropdown__icon--${item.tone}`}><Icon size={20} /></span>
            <span>
              <strong>{item.title}</strong>
              <small>{item.description}</small>
            </span>
          </>
        )
        if (item.disabled) {
          return (
            <button className="nav-dropdown__item is-disabled" disabled key={item.title} role="menuitem" type="button">
              {content}
            </button>
          )
        }
        return (
          <Link className="nav-dropdown__item" key={item.title} onClick={closeNav} role="menuitem" to={item.to}>
            {content}
          </Link>
        )
      })}
    </div>
  )

  return (
    <div className="app-shell">
      <header className={`app-shell__header ${scrolled ? 'header-capsule' : ''}`}>
        <Link className="brand-logo" to="/lists" style={{
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
            background: 'linear-gradient(135deg, #f472b6 0%, #f9a8d4 100%)',
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
        <button
          aria-expanded={mobileNavOpen}
          aria-label="Open navigation"
          className="mobile-nav-toggle"
          onClick={() => {
            setSearchOpen(false)
            setProfileOpen(false)
            setMobileNavOpen((open) => !open)
            setNavMenu('')
          }}
          type="button"
        >
          <Menu size={22} />
        </button>
        <nav className={`app-shell__nav ${mobileNavOpen ? 'is-mobile-open' : ''}`} ref={navRef}>
          <div className="nav-menu">
            <button aria-expanded={navMenu === 'lists'} className={`nav-trigger ${navMenu === 'lists' ? 'is-active' : ''}`} onClick={() => openNav('lists')} type="button">
              Lists {navMenu === 'lists' ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </button>
            {navMenu === 'lists' ? renderDropdown(navSections.lists) : null}
          </div>
          <div className="nav-menu">
            <button aria-expanded={navMenu === 'gifts'} className={`nav-trigger ${navMenu === 'gifts' ? 'is-active' : ''}`} onClick={() => openNav('gifts')} type="button">
              Gifts {navMenu === 'gifts' ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </button>
            {navMenu === 'gifts' ? renderDropdown(navSections.gifts) : null}
          </div>
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
          <div className="quick-create">
            <Link
              aria-label="Create"
              className="icon-button"
              onClick={() => {
                setNavMenu('')
                setProfileOpen(false)
              }}
              to="/lists/new"
            >
              <Plus size={23} />
            </Link>
          </div>
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
              {profileOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {profileOpen ? (
              <div className="profile-menu__panel" role="menu">
                <Link className="profile-menu__identity" onClick={() => setProfileOpen(false)} role="menuitem" to="/profile">
                  {auth.user?.avatar_url ? <img alt="" src={auth.user.avatar_url} /> : <span>{userInitial}</span>}
                  <div>
                    <strong>{auth.user?.name || 'You'}</strong>
                    <small>View profile</small>
                  </div>
                </Link>
                <Link onClick={() => setProfileOpen(false)} role="menuitem" to="/friends">
                  <UsersRound size={17} /> Friends
                </Link>
                <Link onClick={() => setProfileOpen(false)} role="menuitem" to="/sessions">
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
          .app-shell__header {
            min-height: 72px !important;
            padding: 12px 16px !important;
          }

          .app-shell__header.header-capsule {
            margin: 12px auto !important;
            width: calc(100% - 24px) !important;
            padding: 12px 16px !important;
            border-radius: 24px !important;
          }
        }
      `}} />
    </div>
  )
}

export default AppShell
