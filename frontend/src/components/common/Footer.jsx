import React from 'react'

const Footer = () => {
  return (
    <footer style={{ 
      background: 'linear-gradient(135deg, #f3e8ff 0%, #fae8ff 100%)', 
      padding: '64px 24px', 
      textAlign: 'center', 
      marginTop: 'auto',
      borderTop: '1px solid #e9d5ff',
      boxShadow: '0 -10px 30px rgba(192, 132, 252, 0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
        <img alt="Yourz Gift" src="/logo-nobg.png" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        <span style={{ fontSize: '24px', fontWeight: 800, color: '#4c1d95', letterSpacing: '-0.5px' }}>Yourz Gift</span>
      </div>
      <p style={{ opacity: 0.9, marginBottom: '32px', color: '#6b21a8' }}>Making giving and receiving gifts a joyful experience.</p>
      <p style={{ fontSize: '14px', opacity: 0.7, color: '#6b21a8' }}>&copy; {new Date().getFullYear()} Yourz Gift. All rights reserved.</p>
    </footer>
  )
}

export default Footer
