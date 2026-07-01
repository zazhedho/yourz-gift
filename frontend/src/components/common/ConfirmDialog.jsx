import Button from './Button'

const ConfirmDialog = ({ message, onCancel, onConfirm, open, title = 'Confirm action' }) => {
  if (!open) return null

  return (
    <div className="dialog-backdrop" role="presentation">
      <div className="dialog" role="dialog" aria-modal="true" aria-label={title}>
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="actions">
          <Button variant="danger" onClick={onConfirm}>Confirm</Button>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
