import { Camera, Gift, RotateCcw, Star } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import Button from '../../components/common/Button'
import ErrorBanner from '../../components/common/ErrorBanner'
import FormField from '../../components/common/FormField'
import HeroBubbles from '../../components/common/HeroBubbles'
import useAuth from '../../hooks/useAuth'
import authService from '../../services/authService'
import giftService from '../../services/giftService'
import mediaService from '../../services/mediaService'
import { getErrorMessage, getListData, getResponseData } from '../../services/api'
import { isGiftListCurrent } from '../../utils/giftDisplay'

const defaultStats = { activeLists: 0, itemsWished: 0, pastLists: 0 }

const Profile = () => {
  const auth = useAuth()
  const fileRef = useRef(null)
  const [form, setForm] = useState(() => ({
    avatar_url: auth.user?.avatar_url || '',
    email: auth.user?.email || '',
    name: auth.user?.name || '',
    phone: auth.user?.phone || '',
  }))
  const [stats, setStats] = useState(defaultStats)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const userInitial = (form.name || form.email || 'Y').charAt(0).toUpperCase()

  const loadStats = useCallback(async () => {
    try {
      const listResponse = await giftService.listLists()
      const lists = getListData(listResponse)
      const activeLists = lists.filter(isGiftListCurrent).length
      const pastLists = lists.length - activeLists
      const itemResponses = await Promise.all(lists.map((list) => giftService.listItems(list.id)))
      const itemsWished = itemResponses.reduce((total, response) => total + getListData(response).length, 0)
      setStats({ activeLists, itemsWished, pastLists })
    } catch {
      setStats(defaultStats)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const saveProfile = async (payload, successMessage = 'Profile updated') => {
    const response = await authService.updateProfile(payload)
    const user = getResponseData(response)
    auth.setUser?.(user)
    setForm((current) => ({ ...current, ...user }))
    setNotice(successMessage)
    return user
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await saveProfile(form)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update profile'))
    } finally {
      setSaving(false)
    }
  }

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const previousUrl = form.avatar_url
    setUploadingAvatar(true)
    setError('')
    setNotice('')
    try {
      const uploadResponse = await mediaService.uploadImage(file, 'avatars')
      const avatarUrl = getResponseData(uploadResponse)?.url || ''
      if (!avatarUrl) return
      await saveProfile({ ...form, avatar_url: avatarUrl }, 'Avatar updated')
      if (previousUrl && previousUrl !== avatarUrl) {
        mediaService.deleteImage(previousUrl).catch(() => {})
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update avatar'))
    } finally {
      setUploadingAvatar(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <section className="profile-page">
      <div className="profile-hero">
        <HeroBubbles />
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {form.avatar_url ? <img alt="" src={form.avatar_url} /> : userInitial}
          </div>
          <input ref={fileRef} accept="image/*" onChange={uploadAvatar} style={{ display: 'none' }} type="file" />
          <button aria-label="Change avatar" className="profile-avatar-edit" disabled={uploadingAvatar} onClick={() => fileRef.current?.click()} type="button">
            <Camera size={18} />
          </button>
        </div>
        <h1>{form.name || 'You'}</h1>
        <p>Welcome to your Yourz Gift profile</p>
        <div className="profile-stats" aria-label="Profile stats">
          <div><span>Active Lists</span><strong><Gift size={28} /> {stats.activeLists}</strong></div>
          <div><span>Items Wished</span><strong><Star size={30} /> {stats.itemsWished}</strong></div>
          <div><span>Past Lists</span><strong><RotateCcw size={28} /> {stats.pastLists}</strong></div>
        </div>
        <div className="profile-hero__wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M0,82 C220,108 420,108 650,90 C890,72 1055,68 1240,74 C1330,77 1395,82 1440,78 L1440,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      <div className="profile-card">
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', color: '#0f172a', margin: '0 0 8px', fontWeight: 850 }}>Personal Details</h2>
          <p style={{ color: '#64748b', margin: 0, fontSize: '15px' }}>Update your personal information and contact details.</p>
        </div>
        <ErrorBanner message={error} />
        {notice ? <div className="alert alert--success">{notice}</div> : null}

        <form className="form" onSubmit={submit}>
          <div className="form-grid">
            <FormField label="Full Name">
              <input className="input" name="name" onChange={update} required value={form.name} />
            </FormField>
            <FormField label="Email Address">
              <input className="input" name="email" onChange={update} required type="email" value={form.email} />
            </FormField>
            <FormField label="Phone Number">
              <input className="input" name="phone" onChange={update} value={form.phone || ''} />
            </FormField>
            <FormField label="Account Role">
              <input className="input" disabled value={auth.user?.role || 'member'} />
            </FormField>
          </div>

          <div className="profile-actions">
            <Button isLoading={saving} type="submit" style={{ background: 'linear-gradient(135deg, #a78bfa, #e879f9)', color: 'white', border: 'none', borderRadius: '999px', padding: '0 32px', height: '48px', fontWeight: 700, fontSize: '16px', boxShadow: '0 8px 20px rgba(168, 85, 247, 0.25)', transition: 'transform 0.2s, box-shadow 0.2s' }}>Save Changes</Button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Profile
