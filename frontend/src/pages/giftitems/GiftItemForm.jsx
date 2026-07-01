import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'

import Button from '../../components/common/Button'
import ErrorBanner from '../../components/common/ErrorBanner'
import FormField from '../../components/common/FormField'
import giftService from '../../services/giftService'
import { getErrorMessage } from '../../services/api'

const defaultForm = {
  name: '',
  description: '',
  product_url: '',
  image_url: '',
  price: '',
  currency: 'IDR',
  quantity: 1,
  priority: 0,
  is_active: true,
  is_archived: false,
}

const toPayload = (form) => ({
  ...form,
  price: form.price === '' ? null : Number(form.price),
  quantity: Number(form.quantity),
  priority: Number(form.priority),
})

const GiftItemForm = () => {
  const { itemId, listId: routeListId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const editing = Boolean(itemId)
  const stateItem = location.state?.item
  const listId = routeListId || location.state?.listId || stateItem?.list_id
  const [form, setForm] = useState(() => ({ ...defaultForm, ...(stateItem || {}) }))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const update = (event) => {
    const { checked, name, type, value } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (editing) {
        await giftService.updateItem(itemId, toPayload(form))
      } else {
        await giftService.createItem(listId, toPayload(form))
      }
      navigate(`/app/lists/${listId}`)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save gift item'))
    } finally {
      setSubmitting(false)
    }
  }

  if (editing && !stateItem) {
    return (
      <section className="surface">
        <h1>Edit item</h1>
        <p className="muted">Open item edit from a gift list detail page so the current item data is available.</p>
        <Link className="button button--primary" to="/app/lists">Back to lists</Link>
      </section>
    )
  }

  return (
    <section className="surface">
      <div className="page-header">
        <div>
          <h1 className="page-title">{editing ? 'Edit gift item' : 'New gift item'}</h1>
          <p className="page-subtitle">Add practical details guests need before reserving.</p>
        </div>
        <Link className="button button--ghost" to={`/app/lists/${listId}`}>Cancel</Link>
      </div>
      <ErrorBanner message={error} />
      <form className="form" onSubmit={submit}>
        <div className="form-grid">
          <FormField label="Name">
            <input className="input" name="name" onChange={update} required value={form.name} />
          </FormField>
          <FormField label="Currency">
            <input className="input" name="currency" onChange={update} value={form.currency} />
          </FormField>
        </div>
        <FormField label="Description">
          <textarea className="textarea" name="description" onChange={update} value={form.description} />
        </FormField>
        <div className="form-grid">
          <FormField label="Product URL">
            <input className="input" name="product_url" onChange={update} value={form.product_url} />
          </FormField>
          <FormField label="Image URL">
            <input className="input" name="image_url" onChange={update} value={form.image_url} />
          </FormField>
        </div>
        <div className="form-grid">
          <FormField label="Price">
            <input className="input" min="0" name="price" onChange={update} step="0.01" type="number" value={form.price ?? ''} />
          </FormField>
          <FormField label="Quantity">
            <input className="input" min="1" name="quantity" onChange={update} required type="number" value={form.quantity} />
          </FormField>
        </div>
        <FormField label="Priority">
          <input className="input" min="0" name="priority" onChange={update} type="number" value={form.priority} />
        </FormField>
        <label className="checkbox-row">
          <input checked={form.is_active} name="is_active" onChange={update} type="checkbox" />
          Active
        </label>
        <label className="checkbox-row">
          <input checked={form.is_archived} name="is_archived" onChange={update} type="checkbox" />
          Archived
        </label>
        <Button isLoading={submitting} type="submit">{editing ? 'Save item' : 'Create item'}</Button>
      </form>
    </section>
  )
}

export default GiftItemForm
