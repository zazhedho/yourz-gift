import { MapPin } from 'lucide-react'
import { createPortal } from 'react-dom'
import Button from '../../components/common/Button'

const ShippingModal = ({ note, onClose }) => {
  if (note === null || note === undefined) return null

  const modalContent = (
    <div className="dialog-backdrop" role="presentation" style={{ zIndex: 9999 }}>
      <div className="dialog dialog--shipping" role="dialog" aria-modal="true" aria-label="Shipping Address" style={{ maxWidth: '420px', padding: '32px', borderRadius: '24px', textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#10b981',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <MapPin size={32} />
        </div>
        
        <h2 style={{ fontSize: '24px', marginBottom: '16px', color: '#111827' }}>Shipping Details</h2>
        
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <p style={{ margin: 0, fontSize: '16px', lineHeight: 1.6, color: '#475569', whiteSpace: 'pre-wrap', textAlign: 'left' }}>
            {note || 'No shipping details have been provided for this list.'}
          </p>
        </div>
        
        <Button style={{ width: '100%', minHeight: '48px', borderRadius: '99px' }} onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default ShippingModal
