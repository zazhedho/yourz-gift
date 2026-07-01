import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'

import Button from '../../components/common/Button'
import ErrorBanner from '../../components/common/ErrorBanner'
import FormField from '../../components/common/FormField'
import GoogleIdentityButton from '../../components/common/GoogleIdentityButton'
import Loading from '../../components/common/Loading'
import useAuth from '../../hooks/useAuth'
import useRegisterStatus from '../../hooks/useRegisterStatus'
import authService from '../../services/authService'
import { getErrorMessage } from '../../services/api'
import { getGoogleClientId } from '../../utils/runtimeConfig'

const isOTPRequiredError = (err) => getErrorMessage(err, '').toLowerCase().includes('otp_code is required')

const getStoredOTPCooldown = () => {
  const expireTime = sessionStorage.getItem('register_otp_cooldown')
  if (!expireTime) return 0
  const remaining = Math.floor((Number(expireTime) - Date.now()) / 1000)
  if (remaining > 0) return remaining
  sessionStorage.removeItem('register_otp_cooldown')
  return 0
}

const storeOTPCooldown = (cooldownTime) => {
  sessionStorage.setItem('register_otp_cooldown', String(Date.now() + cooldownTime * 1000))
}

const Register = () => {
  const auth = useAuth()
  const { enabled, loading, error: statusError, otp_cooldown: otpCooldown, otp_enabled: otpEnabled } = useRegisterStatus()
  const navigate = useNavigate()
  const [form, setForm] = useState(() => {
    const saved = sessionStorage.getItem('register_form')
    return saved ? JSON.parse(saved) : { email: '', name: '', password: '', phone: '', otp_code: '' }
  })
  const [error, setError] = useState('')
  const [googleError, setGoogleError] = useState('')
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const [otpStep, setOtpStep] = useState(() => sessionStorage.getItem('register_otp_step') === 'true')
  const [cooldown, setCooldown] = useState(getStoredOTPCooldown)
  const [submitting, setSubmitting] = useState(false)
  const googleClientId = getGoogleClientId()

  useEffect(() => {
    sessionStorage.setItem('register_form', JSON.stringify(form))
  }, [form])

  useEffect(() => {
    sessionStorage.setItem('register_otp_step', String(otpStep))
  }, [otpStep])

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = setInterval(() => setCooldown((current) => Math.max(current - 1, 0)), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const updateOTP = (event) => {
    const otpCode = event.target.value.replace(/\D/g, '').slice(0, 6)
    setForm((current) => ({ ...current, otp_code: otpCode }))
  }

  const requestRegisterOTP = async () => {
    await authService.sendRegisterOTP({ email: form.email, phone: form.phone })
    const cooldownTime = Number(otpCooldown || 60)
    setCooldown(cooldownTime)
    storeOTPCooldown(cooldownTime)
    setOtpStep(true)
  }

  const resendOTP = async () => {
    setError('')
    try {
      await requestRegisterOTP()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to resend OTP'))
    }
  }

  const backToDetails = () => {
    setError('')
    setOtpStep(false)
    setCooldown(0)
    setForm((current) => ({ ...current, otp_code: '' }))
    sessionStorage.removeItem('register_otp_step')
    sessionStorage.removeItem('register_otp_cooldown')
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      if (otpEnabled && !otpStep) {
        await requestRegisterOTP()
        return
      }

      if (otpEnabled && !form.otp_code.trim()) {
        setError('OTP code is required')
        return
      }

      const payload = { ...form }
      if (!otpEnabled || !payload.otp_code.trim()) delete payload.otp_code
      const ok = await auth.register(payload)
      if (ok) {
        sessionStorage.removeItem('register_form')
        sessionStorage.removeItem('register_otp_step')
        sessionStorage.removeItem('register_otp_cooldown')
        navigate('/login', { replace: true })
      }
    } catch (err) {
      if (!otpStep && isOTPRequiredError(err)) {
        try {
          await requestRegisterOTP()
          return
        } catch (otpErr) {
          setError(getErrorMessage(otpErr, 'Failed to send OTP'))
          return
        }
      }
      setError(getErrorMessage(err, otpEnabled && !otpStep ? 'Failed to send OTP' : 'Registration failed'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleCredential = async (idToken) => {
    setError('')
    setGoogleError('')
    setGoogleSubmitting(true)
    const ok = await auth.googleLogin(idToken)
    setGoogleSubmitting(false)
    if (ok) navigate('/app/lists', { replace: true })
  }

  if (loading) {
    return (
      <main className="auth-page">
        <section className="surface auth-card">
          <Loading label="Checking registration status" />
        </section>
      </main>
    )
  }

  if (!enabled) {
    return (
      <main className="auth-page">
        <section className="surface auth-card">
          <h1 className="page-title">Registration closed</h1>
          <p className="page-subtitle">New accounts cannot be created right now.</p>
          <ErrorBanner message={statusError || 'Public registration is currently disabled.'} />
          <Link className="button button--primary" to="/login">Back to login</Link>
        </section>
      </main>
    )
  }

  if (otpStep) {
    return (
      <main className="auth-page auth-page-otp">
        <section className="surface auth-card otp-card">
          <p className="meta">Email verification</p>
          <h1 className="page-title">Check your email</h1>
          <p className="page-subtitle">Enter the 6 digit OTP code sent to {form.email}.</p>
          <ErrorBanner message={error || auth.error} />
          <form className="form" onSubmit={submit}>
            <div className="otp-box">
              <FormField label="OTP code">
                <input
                  autoComplete="one-time-code"
                  className="input otp-input"
                  inputMode="numeric"
                  maxLength={6}
                  name="otp_code"
                  onChange={updateOTP}
                  placeholder="000000"
                  required
                  value={form.otp_code}
                />
              </FormField>
              <div className="actions">
                <button className="button button--ghost button--compact" disabled={cooldown > 0} onClick={resendOTP} type="button">
                  {cooldown > 0 ? `Resend ${cooldown}s` : 'Resend OTP'}
                </button>
                <button className="button button--ghost button--compact" onClick={backToDetails} type="button">
                  Change email
                </button>
              </div>
            </div>
            <Button isLoading={submitting} type="submit">Verify and register</Button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <section className="surface auth-card">
        <h1 className="page-title">Create account</h1>
        <p className="page-subtitle">Start a reusable gift list for any occasion.</p>
        <ErrorBanner message={error || auth.error || googleError} />
        <form className="form" onSubmit={submit}>
          {googleClientId ? (
            <GoogleIdentityButton
              disabled={submitting || googleSubmitting}
              label="Sign up with Google"
              onCredential={handleGoogleCredential}
              onError={setGoogleError}
              text="signup_with"
            />
          ) : null}
          <FormField label="Name">
            <input className="input" name="name" onChange={update} required value={form.name} />
          </FormField>
          <FormField label="Email">
            <input className="input" name="email" onChange={update} required type="email" value={form.email} />
          </FormField>
          <FormField label="Phone">
            <input className="input" name="phone" onChange={update} required value={form.phone} />
          </FormField>
          <FormField label="Password">
            <input className="input" minLength={8} name="password" onChange={update} required type="password" value={form.password} />
          </FormField>
          <Button isLoading={submitting} type="submit">{otpEnabled ? 'Send OTP' : 'Register'}</Button>
        </form>
        <p className="meta">Already registered? <Link to="/login">Sign in</Link>.</p>
      </section>
    </main>
  )
}

export default Register
