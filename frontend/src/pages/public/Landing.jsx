import { Link, Navigate } from 'react-router-dom'
import { Gift, Heart, Share2, Sparkles, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import HeroBubbles from '../../components/common/HeroBubbles'
import Footer from '../../components/common/Footer'
import useAuth from '../../hooks/useAuth'

const Landing = () => {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // If user is already logged in, redirect to their lists
  if (user) {
    return <Navigate replace to="/lists" />
  }

  return (
    <div className="landing-page" style={{ minHeight: '100vh', background: '#faf5ff', overflow: 'hidden' }}>
      {/* Header / Navbar */}
      <header className={`landing-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-header-inner">
          <Link className="brand-logo" to="/">
            <span className="brand-logo__mark"><img alt="Yourz Gift" src="/logo-nobg.png" /></span>
            <span className="brand-logo__text" style={{ color: '#4c1d95' }}>Yourz <span>Gift</span></span>
          </Link>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link to="/login" style={{ color: '#7c3aed', fontWeight: 600, textDecoration: 'none', padding: '8px 16px' }} className="nav-login">Sign In</Link>
            <Link to="/register" style={{ background: 'linear-gradient(135deg, #a78bfa, #f9a8d4)', color: 'white', fontWeight: 700, textDecoration: 'none', padding: '10px 24px', borderRadius: '999px', boxShadow: '0 4px 12px rgba(167, 139, 250, 0.3)' }} className="nav-register">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ position: 'relative', paddingTop: '160px', paddingBottom: '120px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%)', zIndex: 0 }} />
        <HeroBubbles />
        
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '800px', padding: '0 24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.6)', padding: '8px 16px', borderRadius: '999px', color: '#9333ea', fontWeight: 600, fontSize: '14px', marginBottom: '24px', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.8)' }}>
            <Sparkles size={16} /> The perfect way to share your wishes
          </div>
          <h1 style={{ fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 850, color: '#4c1d95', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1px' }}>
            Never receive a <br /> <span style={{ background: 'linear-gradient(135deg, #a78bfa, #f9a8d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>bad gift</span> again.
          </h1>
          <p style={{ fontSize: 'clamp(18px, 2.5vw, 22px)', color: '#6b21a8', lineHeight: 1.6, marginBottom: '40px', opacity: 0.9, maxWidth: '600px', margin: '0 auto 40px' }}>
            Create beautiful wish lists, share them with friends and family, and get exactly what you want for your next celebration.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ background: 'linear-gradient(135deg, #a78bfa, #f9a8d4)', color: 'white', fontWeight: 700, textDecoration: 'none', padding: '16px 32px', borderRadius: '999px', fontSize: '18px', boxShadow: '0 8px 24px rgba(167, 139, 250, 0.4)', transition: 'transform 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Create Your List <Star size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '100px 24px', background: '#ffffff', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#4c1d95', marginBottom: '16px' }}>Why use Yourz Gift?</h2>
            <p style={{ fontSize: '18px', color: '#6b21a8', opacity: 0.8 }}>Everything you need to make gifting a breeze.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {/* Feature 1 */}
            <div style={{ background: '#faf5ff', padding: '40px', borderRadius: '32px', border: '1px solid #f3e8ff', textAlign: 'center', transition: 'transform 0.3s' }}>
              <div style={{ background: 'linear-gradient(135deg, #c084fc, #a855f7)', color: 'white', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 20px rgba(168, 85, 247, 0.3)' }}>
                <Gift size={32} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#581c87', marginBottom: '12px' }}>Easy Curation</h3>
              <p style={{ color: '#7e22ce', lineHeight: 1.6 }}>Add items from any store. Keep all your wishes organized in one beautiful place.</p>
            </div>
            
            {/* Feature 2 */}
            <div style={{ background: '#fdf2f8', padding: '40px', borderRadius: '32px', border: '1px solid #fce7f3', textAlign: 'center', transition: 'transform 0.3s' }}>
              <div style={{ background: 'linear-gradient(135deg, #f472b6, #ec4899)', color: 'white', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 20px rgba(236, 72, 153, 0.3)' }}>
                <Share2 size={32} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#831843', marginBottom: '12px' }}>Share Privately</h3>
              <p style={{ color: '#be185d', lineHeight: 1.6 }}>Share your lists only with invited friends or make them public for everyone to see.</p>
            </div>
            
            {/* Feature 3 */}
            <div style={{ background: '#f5f3ff', padding: '40px', borderRadius: '32px', border: '1px solid #ede9fe', textAlign: 'center', transition: 'transform 0.3s' }}>
              <div style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)', color: 'white', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)' }}>
                <Heart size={32} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#312e81', marginBottom: '12px' }}>Avoid Duplicates</h3>
              <p style={{ color: '#4338ca', lineHeight: 1.6 }}>Friends can mark items as reserved so you don't receive the same gift twice.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style dangerouslySetInnerHTML={{__html: `
        .landing-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
          background: transparent;
          backdrop-filter: none;
          border-radius: 0px;
          margin: 0 auto;
          max-width: 100%;
          width: 100%;
          box-shadow: none;
          border: 1px solid transparent;
          border-bottom: 1px solid transparent;
          min-height: auto;
          display: flex;
          align-items: center;
        }

        .landing-header-inner {
          padding: 20px 32px;
          width: 100%;
          transition: padding 0.5s;
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .landing-header.scrolled {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 99px;
          margin: 16px auto;
          max-width: 1200px;
          width: calc(100% - 32px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
          border: 1px solid rgba(233, 213, 255, 0.8);
          min-height: 70px;
        }

        .landing-header.scrolled .landing-header-inner {
          padding: 0 32px;
        }

        @media (max-width: 768px) {
          .landing-header-inner {
            padding: 16px 20px;
          }
          
          .landing-header.scrolled {
            margin: 12px auto;
            width: calc(100% - 24px);
            min-height: 72px;
            border-radius: 24px;
          }

          .landing-header.scrolled .landing-header-inner {
            padding: 12px 16px;
          }

          .nav-login {
            display: none !important; /* Hide sign in text on mobile to save space */
          }
        }
      `}} />
    </div>
  )
}

export default Landing
