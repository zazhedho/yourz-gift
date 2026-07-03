import { createPortal } from 'react-dom'
import Button from './Button'

const ConfirmDialog = ({ message, onCancel, onConfirm, open, title = 'Confirm action' }) => {
  if (!open) return null

  const modalContent = (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog dialog--confirm" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <Button variant="ghost" onClick={onCancel} style={{ borderRadius: '99px', padding: '0 24px' }}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} style={{ borderRadius: '99px', padding: '0 24px' }}>Confirm</Button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default ConfirmDialog
