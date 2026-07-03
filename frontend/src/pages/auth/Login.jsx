import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Gift } from 'lucide-react'

import Button from '../../components/common/Button'
import ErrorBanner from '../../components/common/ErrorBanner'
import FormField from '../../components/common/FormField'
import GoogleIdentityButton from '../../components/common/GoogleIdentityButton'
import useAuth from '../../hooks/useAuth'
import useRegisterStatus from '../../hooks/useRegisterStatus'
import { getGoogleClientId } from '../../utils/runtimeConfig'

const Login = () => {
  const auth = useAuth()
  const { enabled: registerEnabled } = useRegisterStatus()
  const navigate = useNavigate()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [googleError, setGoogleError] = useState('')
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const googleClientId = getGoogleClientId()

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    const ok = await auth.login(form)
    setSubmitting(false)
    if (ok) navigate('/app/lists', { replace: true })
  }

  const handleGoogleCredential = async (idToken) => {
    setGoogleError('')
    setGoogleSubmitting(true)
    const ok = await auth.googleLogin(idToken)
    setGoogleSubmitting(false)
    if (ok) navigate('/app/lists', { replace: true })
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)', borderRadius: '16px', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 24px rgba(244, 63, 94, 0.3)' }}>
            <Gift size={32} strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="page-title">Welcome back</h1>
        <p className="page-subtitle">Sign in to manage your gift lists.</p>
        <ErrorBanner message={auth.error || googleError} />
        {googleClientId ? (
          <GoogleIdentityButton
            disabled={submitting || googleSubmitting}
            label="Continue with Google"
            onCredential={handleGoogleCredential}
            onError={setGoogleError}
            text="signin_with"
          />
        ) : null}
        <form className="form" onSubmit={submit}>
          <FormField label="Email or phone">
            <input className="input" name="identifier" onChange={update} placeholder="wew@example.com" required value={form.identifier} />
          </FormField>
          <FormField label="Password">
            <input className="input" name="password" onChange={update} placeholder="Enter your password" required type="password" value={form.password} />
          </FormField>
          <Button isLoading={submitting} type="submit">Login</Button>
        </form>
        {registerEnabled !== false ? (
          <p className="meta">No account yet? <Link to="/register">Create one</Link>.</p>
        ) : null}
      </section>
    </main>
  )
}

export default Login
