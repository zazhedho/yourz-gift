import { createPortal } from 'react-dom'
import { Loader2, Package, User, X } from 'lucide-react'
import { useState } from 'react'

const ReservationsModal = ({
  cancelingReservationId = '',
  item,
  reservations,
  releaseTarget,
  onCancelReservation,
  onClose,
  onCloseRelease,
  onConfirmRelease,
}) => {
  const [releaseReason, setReleaseReason] = useState('')
  if (!item) return null

  const closeRelease = () => {
    setReleaseReason('')
    onCloseRelease?.()
  }

  const confirmRelease = () => {
    if (!releaseTarget || !onConfirmRelease) return
    onConfirmRelease(releaseTarget, releaseReason.trim())
  }

  return createPortal(
    <div className="dialog-backdrop" onClick={onClose} style={{ zIndex: 9999, backdropFilter: 'blur(8px)', background: 'rgba(15, 23, 42, 0.4)' }}>
      <div className="dialog dialog--reservations" onClick={(e) => e.stopPropagation()} style={{ 
        maxWidth: '540px', padding: '40px',
        background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5) inset',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Decorative background blobs */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(244, 63, 94, 0.15)', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', background: 'rgba(99, 102, 241, 0.1)', filter: 'blur(40px)', borderRadius: '50%', pointerEvents: 'none' }} />

        <button 
          onClick={onClose} 
          aria-label="Close" 
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', zIndex: 10 }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.transform = 'scale(1.05)' }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; e.currentTarget.style.transform = 'scale(1)' }}
        >
          <X size={18} />
        </button>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '28px', margin: '0 0 24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a', fontWeight: 800, letterSpacing: '-0.02em' }}>
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '10px', borderRadius: '14px', display: 'flex', boxShadow: '0 8px 16px rgba(16, 185, 129, 0.2)' }}>
              <Package size={24} color="#ffffff" />
            </div>
            Reservations
          </h2>
          
          <div style={{ marginBottom: '32px', background: 'rgba(255,255,255,0.5)', padding: '16px 20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)' }}>
            <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Reserved Item</span>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{item.name}</p>
          </div>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            {reservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px', background: 'rgba(255,255,255,0.4)', borderRadius: '20px', border: '2px dashed rgba(203, 213, 225, 0.5)' }}>
                <Package size={40} color="#94a3b8" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ color: '#64748b', margin: 0, fontSize: '15px', fontWeight: 500 }}>No reservations for this item yet.</p>
              </div>
            ) : (
              reservations.map((reservation) => {
                const isCanceled = reservation.status === 'canceled'
                const isCanceling = cancelingReservationId === reservation.id
                return (
                <div key={reservation.id} style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.9)',
                  borderRadius: '20px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.03), 0 0 0 1px rgba(255,255,255,0.5) inset',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  opacity: isCanceled ? 0.6 : 1,
                  filter: isCanceled ? 'grayscale(100%)' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div style={{ 
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)', 
                      color: '#ffffff', width: '40px', height: '40px', borderRadius: '14px', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 8px 16px rgba(99, 102, 241, 0.25)'
                    }}>
                      <User size={20} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '15px', marginBottom: '4px', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {reservation.guest_name || reservation.guest_email || 'Guest'}
                      </strong>
                      <div style={{ color: '#64748b', fontSize: '13px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: reservation.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '99px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: reservation.status === 'confirmed' ? '#10b981' : '#f59e0b', flexShrink: 0 }} />
                          <span style={{ textTransform: 'capitalize', color: reservation.status === 'confirmed' ? '#059669' : '#d97706', fontWeight: 600 }}>{reservation.status}</span>
                        </span>
                        {(reservation.created_at || reservation.updated_at) && (
                          <>
                            <span style={{ color: '#cbd5e1' }}>&bull;</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                              {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(reservation.created_at || reservation.updated_at))}
                            </span>
                          </>
                        )}
                      </div>
                      {isCanceled && reservation.cancel_reason ? (
                        <p style={{ color: '#64748b', fontSize: '13px', margin: '8px 0 0', lineHeight: 1.4 }}>
                          Reason: {reservation.cancel_reason}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center', background: 'rgba(241, 245, 249, 0.9)', padding: '6px 12px', borderRadius: '10px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                      <span style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800, marginBottom: '2px' }}>Qty</span>
                      <strong style={{ fontSize: '16px', color: '#0f172a', lineHeight: 1 }}>{reservation.quantity}</strong>
                    </div>
                    {!isCanceled && onCancelReservation ? (
                      <button
                        disabled={isCanceling}
                        onClick={() => onCancelReservation(reservation)}
                        style={{
                          alignItems: 'center',
                          background: '#ef4444',
                          border: 'none',
                          borderRadius: '999px',
                          color: '#ffffff',
                          cursor: isCanceling ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          fontSize: '13px',
                          fontWeight: 700,
                          gap: '6px',
                          opacity: isCanceling ? 0.7 : 1,
                          padding: '8px 16px',
                          transition: 'all 0.2s',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                        }}
                        type="button"
                        onMouseOver={(e) => { if(!isCanceling) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)'; e.currentTarget.style.background = '#dc2626' } }}
                        onMouseOut={(e) => { if(!isCanceling) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'; e.currentTarget.style.background = '#ef4444' } }}
                      >
                        {isCanceling ? <Loader2 className="spinner" size={14} /> : null}
                        Release
                      </button>
                    ) : null}
                  </div>
                </div>
                )
              })
            )}
          </div>
        </div>
      </div>
      {releaseTarget ? (
        <div className="dialog-backdrop" onClick={closeRelease} style={{ zIndex: 10000, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)' }}>
          <div className="dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Release reservation" style={{ maxWidth: '420px', padding: '28px', background: '#ffffff', borderRadius: '24px' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: '22px', color: '#0f172a' }}>Release reservation</h3>
            <p style={{ margin: '0 0 18px', color: '#64748b', lineHeight: 1.5 }}>
              Add optional note why this reservation is released.
            </p>
            <textarea
              autoFocus
              maxLength={500}
              onChange={(event) => setReleaseReason(event.target.value)}
              placeholder="Example: Guest changed plan"
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                boxSizing: 'border-box',
                color: '#0f172a',
                font: 'inherit',
                minHeight: '120px',
                padding: '14px',
                resize: 'vertical',
                width: '100%',
              }}
              value={releaseReason}
            />
            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '6px', textAlign: 'right' }}>{releaseReason.length}/500</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button onClick={closeRelease} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '999px', color: '#334155', cursor: 'pointer', fontWeight: 800, padding: '10px 16px' }} type="button">
                Cancel
              </button>
              <button disabled={cancelingReservationId === releaseTarget.id} onClick={confirmRelease} style={{ alignItems: 'center', background: '#ef4444', border: 0, borderRadius: '999px', color: '#ffffff', cursor: cancelingReservationId === releaseTarget.id ? 'not-allowed' : 'pointer', display: 'inline-flex', fontWeight: 800, gap: '8px', opacity: cancelingReservationId === releaseTarget.id ? 0.75 : 1, padding: '10px 16px' }} type="button">
                {cancelingReservationId === releaseTarget.id ? <Loader2 className="spinner" size={16} /> : null}
                Release
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>,
    document.body
  )
}

export default ReservationsModal
