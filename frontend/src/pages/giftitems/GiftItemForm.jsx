import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Package } from 'lucide-react'

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
    <section className="surface" style={{ padding: '40px' }}>
      <div className="page-header" style={{ marginBottom: '40px', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '32px', letterSpacing: '-0.02em', color: '#111827' }}>{editing ? 'Edit Gift Item' : 'Create New Gift Item'}</h1>
          <p className="page-subtitle" style={{ fontSize: '15px', color: 'var(--color-shade-50)' }}>Add practical details guests need before reserving.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link className="button button--ghost" to={`/app/lists/${listId}`} style={{ borderRadius: '99px', padding: '0 24px', minHeight: '40px', fontWeight: 600, color: 'var(--color-shade-60)', background: 'rgba(0,0,0,0.05)' }}>Cancel</Link>
          <Button isLoading={submitting} type="submit" onClick={submit} className="button" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)', color: 'white', padding: '0 24px', borderRadius: '99px', minHeight: '40px', fontWeight: 600, border: 'none', boxShadow: '0 4px 12px rgba(244,63,94,0.3)', letterSpacing: '0.5px' }}>{editing ? 'Save changes' : 'Create item'}</Button>
        </div>
      </div>

      <ErrorBanner message={error} />

      <form className="form" onSubmit={submit} style={{ display: 'grid', gap: '24px' }}>
        
        {/* Basic Info Section */}
        <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Basic Information</h3>
          <div className="form-grid">
            <FormField label="Item Name">
              <input className="input" name="name" onChange={update} required value={form.name} placeholder="e.g. Espresso Machine" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }} />
            </FormField>
            <FormField label="Priority Level">
              <div style={{ display: 'flex', width: '100%', borderRadius: '12px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '4px' }}>
                {[
                  { value: 0, label: 'Low' },
                  { value: 1, label: 'Medium' },
                  { value: 2, label: 'High' }
                ].map(option => {
                  const isSelected = Number(form.priority) === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('priority', option.value)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        background: isSelected ? '#ffffff' : 'transparent',
                        color: isSelected ? '#111827' : '#64748b',
                        boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </FormField>
          </div>
          <div style={{ marginTop: '20px' }}>
            <FormField label="Description">
              <textarea className="textarea" name="description" onChange={update} value={form.description} placeholder="Any specific details, colors, or sizes..." style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }} />
            </FormField>
          </div>
        </div>

        {/* Pricing & Quantity */}
        <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Pricing & Quantity</h3>
          <div className="form-grid">
            <FormField label="Estimated Price">
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-shade-50)', fontWeight: 600 }}>{form.currency}</span>
                <input className="input" min="0" name="price" onChange={update} step="0.01" type="number" value={form.price ?? ''} placeholder="0.00" style={{ paddingLeft: '64px', background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }} />
              </div>
            </FormField>
            <FormField label="Currency">
              <div style={{ position: 'relative' }}>
                <select className="select" name="currency" onChange={update} value={form.currency} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }}>
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
          <div style={{ marginTop: '20px', maxWidth: '300px' }}>
            <FormField label="Desired Quantity">
              <input className="input" min="1" name="quantity" onChange={update} required type="number" value={form.quantity} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }} />
            </FormField>
          </div>
        </div>

        {/* Media & Links Section */}
        <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Reference & Media</h3>
          <ImageUploadField
            folder="gift-items"
            label="Item image"
            onChange={(url) => updateField('image_url', url)}
            value={form.image_url}
          />
          <div style={{ marginTop: '24px' }}>
            <FormField label="Product URL">
              <input className="input" name="product_url" onChange={update} value={form.product_url} placeholder="https://store.com/item" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }} />
            </FormField>
          </div>
        </div>

        {/* Settings Section */}
        <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Settings</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <label className="checkbox-row" style={{ fontWeight: 600, cursor: 'pointer', color: '#111827' }}>
              <input checked={form.is_active} name="is_active" onChange={update} type="checkbox" style={{ accentColor: '#f43f5e', width: '20px', height: '20px' }} />
              Active Status (Visible to guests)
            </label>
            <label className="checkbox-row" style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--color-shade-50)' }}>
              <input checked={form.is_archived} name="is_archived" onChange={update} type="checkbox" style={{ accentColor: 'var(--color-shade-40)', width: '20px', height: '20px' }} />
              Archived (Hidden from active management)
            </label>
          </div>
        </div>

      </form>
    </section>
  )
}

export default GiftItemForm
