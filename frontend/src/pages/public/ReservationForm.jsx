import { Gift, X } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'

import Button from '../../components/common/Button'
import ErrorBanner from '../../components/common/ErrorBanner'
import FormField from '../../components/common/FormField'
import giftService from '../../services/giftService'
import { getErrorMessage } from '../../services/api'

const clampQuantity = (value, maxQuantity) => {
  if (value === '') return ''
  const quantity = Number(value)
  if (!Number.isFinite(quantity) || quantity < 1) return 1
  return Math.min(quantity, maxQuantity)
}

const ReservationForm = ({ code, item, onClose, onReserved }) => {
  const [form, setForm] = useState({
    guest_email: '',
    guest_name: '',
    quantity: 1,
    note: '',
    show_name: true,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const maxQuantity = Math.max(1, Number(item.quantity_remaining ?? item.quantity ?? 1))

  const update = (event) => {
    const { checked, name, type, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: name === 'quantity' ? clampQuantity(value, maxQuantity) : type === 'checkbox' ? checked : value,
    }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await giftService.reservePublicItem(code, item.id, {
        ...form,
        quantity: clampQuantity(form.quantity, maxQuantity) || 1,
      })
      onReserved()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reserve gift'))
    } finally {
      setSubmitting(false)
    }
  }

  const modalContent = (
    <div className="dialog-backdrop" role="presentation" style={{ zIndex: 9999 }}>
      <section className="dialog dialog--reservation-form" role="dialog" aria-modal="true" aria-label={`Reserve ${item.name}`} style={{ maxWidth: '420px', padding: '24px', borderRadius: '24px' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '16px', top: '16px', background: 'transparent', border: 0, color: '#94a3b8', cursor: 'pointer', padding: '4px', display: 'flex' }}><X size={20} /></button>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'rgba(244, 63, 94, 0.1)',
            color: '#f43f5e',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Gift size={24} />
          </div>
          <h2 style={{ fontSize: '20px', margin: '0 0 4px', color: '#111827', fontWeight: 800 }}>Reserve this gift</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: 1.5 }}>
            Help the owner avoid duplicates by telling them you are getting <strong>{item.name}</strong>.
          </p>
        </div>
        <ErrorBanner message={error} />
        <form className="form" onSubmit={submit} style={{ gap: '12px' }}>
          <FormField label="Email">
            <input className="input" name="guest_email" onChange={update} required type="email" value={form.guest_email} placeholder="Where can we reach you?" />
          </FormField>
          <FormField label="Name (Optional)">
            <input className="input" name="guest_name" onChange={update} value={form.guest_name} placeholder="Your name" />
          </FormField>
          <FormField label="Quantity">
            <input className="input" max={maxQuantity} min="1" name="quantity" onChange={update} required type="number" value={form.quantity} />
          </FormField>
          <FormField label="Note (Optional)">
            <textarea className="textarea" name="note" onChange={update} value={form.note} placeholder="Any message for the owner?" rows={2} />
          </FormField>
          <label className="checkbox-row" style={{ marginTop: '4px', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input checked={form.show_name} name="show_name" onChange={update} type="checkbox" style={{ width: '18px', height: '18px', accentColor: '#f43f5e' }} />
            <span style={{ fontSize: '14px', color: '#334155', fontWeight: 500 }}>Show my name to the owner</span>
          </label>
          <div className="actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' }}>
            <Button variant="ghost" onClick={onClose} style={{ width: '100%', minHeight: '44px', borderRadius: '99px', fontSize: '15px', color: '#64748b', background: '#f1f5f9' }}>Cancel</Button>
            <Button isLoading={submitting} type="submit" style={{ width: '100%', minHeight: '44px', borderRadius: '99px', background: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)', color: 'white', border: 'none', fontSize: '15px', fontWeight: 700, boxShadow: '0 4px 12px rgba(244, 63, 94, 0.25)' }}>Confirm</Button>
          </div>
        </form>
      </section>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default ReservationForm
