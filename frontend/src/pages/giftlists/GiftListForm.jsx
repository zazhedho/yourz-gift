import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Gift, Cake, Heart, Baby, Home, PartyPopper, Globe, Lock, Clock, User } from 'lucide-react'

import Button from '../../components/common/Button'
import ErrorBanner from '../../components/common/ErrorBanner'
import FormField from '../../components/common/FormField'
import ImageUploadField from '../../components/common/ImageUploadField'
import Loading from '../../components/common/Loading'
import giftService from '../../services/giftService'
import { getErrorMessage, getResponseData } from '../../services/api'

const defaultForm = {
  title: '',
  description: '',
  occasion_type: 'custom',
  cover_image_url: '',
  shipping_note: '',
  visibility: 'public',
  reservation_visibility: 'immediately',
  is_active: true,
}

const GiftListForm = () => {
  const { listId } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(listId)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(editing)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!editing) return
    setLoading(true)
    try {
      const response = await giftService.getList(listId)
      const data = getResponseData(response)
      setForm({ ...defaultForm, ...data })
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load gift list'))
    } finally {
      setLoading(false)
    }
  }, [editing, listId])

  useEffect(() => {
    load()
  }, [load])

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
      const payload = { ...form }
      if (editing) {
        await giftService.updateList(listId, payload)
        navigate(`/app/lists/${listId}`)
      } else {
        const response = await giftService.createList(payload)
        const created = getResponseData(response)
        navigate(created?.id ? `/app/lists/${created.id}` : '/app/lists')
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save gift list'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading label="Loading gift list" />

  return (
    <section className="surface" style={{ padding: '40px' }}>
      <div className="page-header" style={{ marginBottom: '40px', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '24px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '32px', letterSpacing: '-0.02em', color: '#111827' }}>{editing ? 'Edit Gift List' : 'Create New Gift List'}</h1>
          <p className="page-subtitle" style={{ fontSize: '15px', color: 'var(--color-shade-50)' }}>Personalize your list for birthdays, weddings, or any custom occasion.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link className="button button--ghost" to={editing ? `/app/lists/${listId}` : '/app/lists'} style={{ borderRadius: '99px', padding: '0 24px', minHeight: '40px', fontWeight: 600, color: 'var(--color-shade-60)', background: 'rgba(0,0,0,0.05)' }}>Cancel</Link>
          <Button isLoading={submitting} type="submit" onClick={submit} className="button" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)', color: 'white', padding: '0 24px', borderRadius: '99px', minHeight: '40px', fontWeight: 600, border: 'none', boxShadow: '0 4px 12px rgba(244,63,94,0.3)', letterSpacing: '0.5px' }}>{editing ? 'Save changes' : 'Create list'}</Button>
        </div>
      </div>
      
      <ErrorBanner message={error} />
      
      <form className="form" onSubmit={submit} style={{ display: 'grid', gap: '24px' }}>
        
        {/* Basic Info Section */}
        <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Basic Information</h3>
          <div className="form-grid">
            <FormField label="Title">
              <input className="input" name="title" onChange={update} required value={form.title} placeholder="e.g. My 25th Birthday" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }} />
            </FormField>
            <FormField label="Occasion">
              <select className="select" name="occasion_type" onChange={update} value={form.occasion_type} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }}>
                <button><selectedcontent></selectedcontent></button>
                <option value="custom"><Gift size={18} aria-hidden="true" /> Custom</option>
                <option value="birthday"><Cake size={18} aria-hidden="true" /> Birthday</option>
                <option value="wedding"><Heart size={18} aria-hidden="true" /> Wedding</option>
                <option value="baby_shower"><Baby size={18} aria-hidden="true" /> Baby shower</option>
                <option value="housewarming"><Home size={18} aria-hidden="true" /> Housewarming</option>
                <option value="holiday"><PartyPopper size={18} aria-hidden="true" /> Holiday</option>
              </select>
            </FormField>
          </div>
          <div style={{ marginTop: '20px' }}>
            <FormField label="Description">
              <textarea className="textarea" name="description" onChange={update} value={form.description} placeholder="Tell your friends what this list is for..." style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }} />
            </FormField>
          </div>
        </div>

        {/* Media & Shipping Section */}
        <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Media & Shipping</h3>
        <ImageUploadField
          folder="gift-lists"
          label="Cover image"
          onChange={(url) => updateField('cover_image_url', url)}
          value={form.cover_image_url}
        />
          <div style={{ marginTop: '24px' }}>
            <FormField label="Shipping note">
              <textarea className="textarea" name="shipping_note" onChange={update} value={form.shipping_note} placeholder="Any specific instructions for delivery?" style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }} />
            </FormField>
          </div>
        </div>

        {/* Settings Section */}
        <div style={{ background: 'rgba(255, 255, 255, 0.5)', padding: '32px', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '18px', fontWeight: 700, color: '#111827' }}>Settings</h3>
          <div className="form-grid">
            <FormField label="Visibility">
              <select className="select" name="visibility" onChange={update} value={form.visibility} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }}>
                <button><selectedcontent></selectedcontent></button>
                <option value="public"><Globe size={18} aria-hidden="true" /> Public</option>
                <option value="private"><Lock size={18} aria-hidden="true" /> Private</option>
              </select>
            </FormField>
            <FormField label="Reservation visibility">
              <select className="select" name="reservation_visibility" onChange={update} value={form.reservation_visibility} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px' }}>
                <button><selectedcontent></selectedcontent></button>
                <option value="immediately"><Clock size={18} aria-hidden="true" /> Immediately</option>
                <option value="owner_only"><User size={18} aria-hidden="true" /> Owner only</option>
              </select>
            </FormField>
          </div>
          <div style={{ marginTop: '24px' }}>
            <label className="checkbox-row" style={{ fontWeight: 600, cursor: 'pointer', color: '#111827' }}>
              <input checked={form.is_active} name="is_active" onChange={update} type="checkbox" style={{ accentColor: '#f43f5e', width: '20px', height: '20px' }} />
              List is Active
            </label>
          </div>
        </div>
        
      </form>
    </section>
  )
}

export default GiftListForm
