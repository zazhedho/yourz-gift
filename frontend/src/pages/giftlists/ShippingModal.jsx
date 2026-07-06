import { MapPin, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import Button from '../../components/common/Button'

const ShippingModal = ({ note, onClose }) => {
  const [copied, setCopied] = useState(false)

  if (note === null || note === undefined) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(note || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  const modalContent = (
    <div className="dialog-backdrop" role="presentation" style={{ zIndex: 9999 }}>
      <div className="dialog dialog--shipping" role="dialog" aria-modal="true" aria-label="Shipping Address" style={{ maxWidth: '420px', padding: '32px', borderRadius: '24px', textAlign: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          background: 'rgba(16, 185, 129, 0.1)',
          color: '#f472b6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <MapPin size={28} />
        </div>
        
        <h2 style={{ fontSize: '22px', marginBottom: '20px', color: '#111827' }}>Shipping Details</h2>
        
        <div style={{ background: '#f8fafc', padding: '24px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: '500', lineHeight: 1.6, color: '#1e293b', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
            {note || 'No shipping details have been provided for this list.'}
          </p>
        </div>
        
        {note && (
          <Button 
            style={{ 
              width: '100%', 
              minHeight: '48px', 
              borderRadius: '99px', 
              background: '#f1f5f9', 
              color: copied ? '#f472b6' : '#334155', 
              border: 'none', 
              marginBottom: '12px',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600'
            }} 
            onClick={handleCopy}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied to clipboard!' : 'Copy Address'}
          </Button>
        )}

        <Button style={{ width: '100%', minHeight: '48px', borderRadius: '99px', background: '#111827', color: '#ffffff', border: 'none' }} onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default ShippingModal
