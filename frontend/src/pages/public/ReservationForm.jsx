import { useState } from 'react'
import { createPortal } from 'react-dom'

import Button from '../../components/common/Button'
import ErrorBanner from '../../components/common/ErrorBanner'
import FormField from '../../components/common/FormField'
import giftService from '../../services/giftService'
import { getErrorMessage } from '../../services/api'

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
  const maxQuantity = item.quantity_remaining ?? item.quantity ?? 1

  const update = (event) => {
    const { checked, name, type, value } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await giftService.reservePublicItem(code, item.id, {
        ...form,
        quantity: Number(form.quantity),
      })
      onReserved()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reserve gift'))
    } finally {
      setSubmitting(false)
    }
  }

  const modalContent = (
    <div className="dialog-backdrop" role="presentation">
      <section className="dialog" role="dialog" aria-modal="true" aria-label={`Reserve ${item.name}`}>
        <h2>Reserve {item.name}</h2>
        <p className="muted">Your reservation helps the owner avoid duplicates.</p>
        <ErrorBanner message={error} />
        <form className="form" onSubmit={submit}>
          <FormField label="Email">
            <input className="input" name="guest_email" onChange={update} required type="email" value={form.guest_email} />
          </FormField>
          <FormField label="Name">
            <input className="input" name="guest_name" onChange={update} value={form.guest_name} />
          </FormField>
          <FormField label="Quantity">
            <input className="input" max={maxQuantity} min="1" name="quantity" onChange={update} required type="number" value={form.quantity} />
          </FormField>
          <FormField label="Note">
            <textarea className="textarea" name="note" onChange={update} value={form.note} />
          </FormField>
          <label className="checkbox-row">
            <input checked={form.show_name} name="show_name" onChange={update} type="checkbox" />
            Show my name to the owner
          </label>
          <div className="actions">
            <Button isLoading={submitting} type="submit">Reserve gift</Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </section>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default ReservationForm
