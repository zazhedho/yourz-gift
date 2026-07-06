import { Gift } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'

const PublicShell = () => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="app-shell">
      <header className={`app-shell__header ${scrolled ? 'header-capsule' : ''}`}>
        <Link className="brand-logo" to="/" style={{
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
            background: 'linear-gradient(135deg, #a78bfa 0%, #f9a8d4 100%)',
            borderRadius: '10px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(168, 85, 247, 0.25)'
          }}>
            <Gift size={20} strokeWidth={2.5} />
          </div>
          Yourz<span style={{ fontWeight: 300, color: '#6b7280' }}>Gift</span>
        </Link>
        <div className="app-shell__actions">
          <Link to="/register" className="public-cta-button">
            Create your list
          </Link>
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
          background: rgba(255, 255, 255, 0.95) !important;
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
        
        .public-cta-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #e879f9 0%, #a78bfa 100%);
          color: #ffffff;
          text-decoration: none;
          font-weight: 700;
          font-size: 15px;
          padding: 10px 24px;
          border-radius: 999px;
          box-shadow: 0 6px 20px rgba(217, 70, 239, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        
        .public-cta-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transition: left 0.6s ease;
        }
        
        .public-cta-button:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 10px 25px rgba(16, 185, 129, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.3);
          color: #ffffff;
        }
        
        .public-cta-button:hover::after {
          left: 100%;
        }
        
        .public-cta-button:active {
          transform: translateY(1px);
          box-shadow: 0 2px 10px rgba(16, 185, 129, 0.2);
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

export default PublicShell
