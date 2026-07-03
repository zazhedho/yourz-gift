import React from 'react'
import { createPortal } from 'react-dom'
import { X, User, Package } from 'lucide-react'

const ReservationsModal = ({ item, reservations, onClose }) => {
  if (!item) return null

  return createPortal(
    <div className="dialog-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%', padding: '32px', borderRadius: '24px', background: '#ffffff', position: 'relative' }}>
        <button 
          onClick={onClose} 
          aria-label="Close" 
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={18} />
        </button>
        
        <h2 style={{ fontSize: '22px', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a' }}>
          <Package size={26} color="#10b981" /> Reservations
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Item</span>
          <p style={{ margin: '4px 0 0', fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{item.name}</p>
        </div>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          {reservations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <p style={{ color: '#64748b', margin: 0 }}>No reservation for this item yet.</p>
            </div>
          ) : (
            reservations.map((reservation) => (
              <div key={reservation.id} style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', color: '#4f46e5', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#1e293b', fontSize: '15px', marginBottom: '2px' }}>
                      {reservation.guest_name || reservation.guest_email || 'Guest'}
                    </strong>
                    <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                      <span>Status: <span style={{ textTransform: 'capitalize', color: reservation.status === 'confirmed' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{reservation.status}</span></span>
                      {(reservation.created_at || reservation.updated_at) && (
                        <>
                          <span style={{ color: '#cbd5e1' }}>&bull;</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(reservation.created_at || reservation.updated_at))}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
                  <span style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Qty</span>
                  <strong style={{ fontSize: '16px', color: '#1e293b', lineHeight: 1 }}>{reservation.quantity}</strong>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ReservationsModal
