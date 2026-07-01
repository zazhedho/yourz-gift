import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import Button from '../../components/common/Button'
import ErrorBanner from '../../components/common/ErrorBanner'
import FormField from '../../components/common/FormField'
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
    <section className="surface">
      <div className="page-header">
        <div>
          <h1 className="page-title">{editing ? 'Edit gift list' : 'New gift list'}</h1>
          <p className="page-subtitle">Use one flow for birthdays, weddings, housewarmings, holidays, or custom occasions.</p>
        </div>
        <Link className="button button--ghost" to={editing ? `/app/lists/${listId}` : '/app/lists'}>Cancel</Link>
      </div>
      <ErrorBanner message={error} />
      <form className="form" onSubmit={submit}>
        <div className="form-grid">
          <FormField label="Title">
            <input className="input" name="title" onChange={update} required value={form.title} />
          </FormField>
          <FormField label="Occasion">
            <select className="select" name="occasion_type" onChange={update} value={form.occasion_type}>
              <option value="custom">Custom</option>
              <option value="birthday">Birthday</option>
              <option value="wedding">Wedding</option>
              <option value="baby_shower">Baby shower</option>
              <option value="housewarming">Housewarming</option>
              <option value="holiday">Holiday</option>
            </select>
          </FormField>
        </div>
        <FormField label="Description">
          <textarea className="textarea" name="description" onChange={update} value={form.description} />
        </FormField>
        <FormField label="Cover image URL">
          <input className="input" name="cover_image_url" onChange={update} value={form.cover_image_url} />
        </FormField>
        <FormField label="Shipping note">
          <textarea className="textarea" name="shipping_note" onChange={update} value={form.shipping_note} />
        </FormField>
        <div className="form-grid">
          <FormField label="Visibility">
            <select className="select" name="visibility" onChange={update} value={form.visibility}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </FormField>
          <FormField label="Reservation visibility">
            <select className="select" name="reservation_visibility" onChange={update} value={form.reservation_visibility}>
              <option value="immediately">Immediately</option>
              <option value="owner_only">Owner only</option>
            </select>
          </FormField>
        </div>
        <label className="checkbox-row">
          <input checked={form.is_active} name="is_active" onChange={update} type="checkbox" />
          Active
        </label>
        <Button isLoading={submitting} type="submit">{editing ? 'Save changes' : 'Create list'}</Button>
      </form>
    </section>
  )
}

export default GiftListForm
