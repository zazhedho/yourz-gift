import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Package, AlignLeft, Link2, Image as ImageIcon, DollarSign, Layers, Settings, Save, Box } from 'lucide-react'

import Button from '../../components/common/Button'
import ErrorBanner from '../../components/common/ErrorBanner'
import FormField from '../../components/common/FormField'
import ImageUploadField from '../../components/common/ImageUploadField'
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
  const updateField = (name, value) => setForm((current) => ({ ...current, [name]: value }))

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
      <section className="surface" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: 'var(--radius-xl)' }}>
        <Package size={48} color="var(--color-shade-30)" style={{ marginBottom: '16px' }} />
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>Edit item</h1>
        <p className="muted" style={{ maxWidth: '400px', margin: '0 auto 24px' }}>
          Open item edit from a gift list detail page so the current item data is available.
        </p>
        <Link className="button" style={{ background: 'var(--color-primary)', color: 'white' }} to="/app/lists">Back to lists</Link>
      </section>
    )
  }

  return (
    <section className="surface" style={{ padding: '32px' }}>
      <div className="page-header" style={{ marginBottom: '32px', borderBottom: '1px solid var(--color-hairline-light)', paddingBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '32px' }}>{editing ? 'Edit Gift Item' : 'Create New Gift Item'}</h1>
          <p className="page-subtitle">Add practical details guests need before reserving.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link className="button button--ghost" to={`/app/lists/${listId}`}>Cancel</Link>
          <Button isLoading={submitting} type="submit" onClick={submit} className="button button--primary">{editing ? 'Save changes' : 'Create item'}</Button>
        </div>
      </div>

      <ErrorBanner message={error} />

      <form className="form" onSubmit={submit} style={{ display: 'grid', gap: '32px' }}>
        
        {/* Basic Info Section */}
        <div style={{ padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline-light)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)' }}>Basic Information</h3>
          <div className="form-grid">
            <FormField label="Item Name">
              <input className="input" name="name" onChange={update} required value={form.name} placeholder="e.g. Espresso Machine" />
            </FormField>
            <FormField label="Priority Level">
              <input className="input" min="0" name="priority" onChange={update} type="number" value={form.priority} placeholder="0 = lowest priority" />
            </FormField>
          </div>
          <div style={{ marginTop: '16px' }}>
            <FormField label="Description">
              <textarea className="textarea" name="description" onChange={update} value={form.description} placeholder="Any specific details, colors, or sizes..." />
            </FormField>
          </div>
        </div>

        {/* Pricing & Quantity */}
        <div style={{ padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline-light)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)' }}>Pricing & Quantity</h3>
          <div className="form-grid">
            <FormField label="Estimated Price">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-shade-40)', fontWeight: 500 }}>{form.currency}</span>
                <input className="input" min="0" name="price" onChange={update} step="0.01" type="number" value={form.price ?? ''} placeholder="0.00" style={{ paddingLeft: '60px' }} />
              </div>
            </FormField>
            <FormField label="Currency">
              <div style={{ position: 'relative' }}>
                <select className="select" name="currency" onChange={update} value={form.currency}>
                  <button><selectedcontent></selectedcontent></button>
                  <option value="IDR">IDR - Rupiah</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="SGD">SGD - Singapore Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
            </FormField>
          </div>
          <div style={{ marginTop: '16px', maxWidth: '300px' }}>
            <FormField label="Desired Quantity">
              <input className="input" min="1" name="quantity" onChange={update} required type="number" value={form.quantity} />
            </FormField>
          </div>
        </div>

        {/* Media & Links Section */}
        <div style={{ padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline-light)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)' }}>Reference & Media</h3>
          <ImageUploadField
            folder="gift-items"
            label="Item image"
            onChange={(url) => updateField('image_url', url)}
            value={form.image_url}
          />
          <div style={{ marginTop: '16px' }}>
            <FormField label="Product URL">
              <input className="input" name="product_url" onChange={update} value={form.product_url} placeholder="https://store.com/item" />
            </FormField>
          </div>
        </div>

        {/* Settings Section */}
        <div style={{ padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-hairline-light)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px', fontWeight: 600, color: 'var(--color-ink)' }}>Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label className="checkbox-row" style={{ fontWeight: 500, cursor: 'pointer' }}>
              <input checked={form.is_active} name="is_active" onChange={update} type="checkbox" style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }} />
              Active Status (Visible to guests)
            </label>
            <label className="checkbox-row" style={{ fontWeight: 500, cursor: 'pointer' }}>
              <input checked={form.is_archived} name="is_archived" onChange={update} type="checkbox" style={{ accentColor: 'var(--color-shade-40)', width: '18px', height: '18px' }} />
              Archived (Hidden from active management)
            </label>
          </div>
        </div>

      </form>
    </section>
  )
}

export default GiftItemForm
