import { useState } from 'react'

import Button from '../../components/common/Button'
import ErrorBanner from '../../components/common/ErrorBanner'
import FormField from '../../components/common/FormField'
import useAuth from '../../hooks/useAuth'
import authService from '../../services/authService'
import { getErrorMessage, getResponseData } from '../../services/api'

const Profile = () => {
  const auth = useAuth()
  const [form, setForm] = useState(() => ({
    email: auth.user?.email || '',
    name: auth.user?.name || '',
    phone: auth.user?.phone || '',
  }))
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const userInitial = (auth.user?.name || auth.user?.email || 'Y').charAt(0).toUpperCase()

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const response = await authService.updateProfile(form)
      auth.setUser?.(getResponseData(response))
      setNotice('Profile updated')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update profile'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <section style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ 
          width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #fb923c)',
          margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '40px', fontWeight: 'bold', boxShadow: '0 12px 24px rgba(244,63,94,0.25)',
          border: '4px solid rgba(255,255,255,0.8)'
        }}>
          {auth.user?.avatar_url ? <img src={auth.user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : userInitial}
        </div>
        <h1 style={{ fontSize: '38px', fontWeight: 800, marginBottom: '8px', color: '#111827', letterSpacing: '-0.03em' }}>My Profile</h1>
        <p style={{ fontSize: '16px', color: 'var(--color-shade-50)', margin: 0 }}>Manage your personal details and account settings</p>
      </div>

      <div className="surface" style={{ padding: '32px 40px' }}>
        <ErrorBanner message={error} />
        {notice ? <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#059669', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 500 }}>{notice}</div> : null}

        <form className="form" onSubmit={submit}>
          <div className="form-grid" style={{ gap: '24px' }}>
            <FormField label="Full Name">
              <input className="input" name="name" onChange={update} required value={form.name} placeholder="Your full name" style={{ background: 'rgba(255,255,255,0.5)' }} />
            </FormField>
            
            <FormField label="Email Address">
              <input className="input" name="email" onChange={update} required type="email" value={form.email} placeholder="you@example.com" style={{ background: 'rgba(255,255,255,0.5)' }} />
            </FormField>
            
            <FormField label="Phone Number">
              <input className="input" name="phone" onChange={update} value={form.phone} placeholder="+1 (555) 000-0000" style={{ background: 'rgba(255,255,255,0.5)' }} />
            </FormField>
            
            <FormField label="Account Role">
              <input className="input" disabled value={auth.user?.role || 'member'} style={{ opacity: 0.6, cursor: 'not-allowed', textTransform: 'capitalize', background: 'rgba(255,255,255,0.3)' }} />
            </FormField>
          </div>
          
          <div style={{ marginTop: '36px', paddingTop: '28px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
            <Button isLoading={saving} type="submit" className="button" style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)', color: 'white', padding: '0 32px', borderRadius: '99px', minHeight: '44px', fontWeight: 600, border: 'none', boxShadow: '0 6px 16px rgba(244,63,94,0.3)', letterSpacing: '0.5px' }}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Profile
