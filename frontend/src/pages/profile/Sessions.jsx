import { MonitorSmartphone, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import authService from '../../services/authService'
import { getErrorMessage, getResponseData } from '../../services/api'

const formatDate = (value) => {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const getSessionTime = (session) => {
  const time = new Date(session.last_activity || session.login_at || 0).getTime()
  return Number.isNaN(time) ? 0 : time
}

const normalizeCurrentSession = (sessions) => {
  const storedSessionId = localStorage.getItem('session_id')
  const withStoredCurrent = sessions.map((session) => ({
    ...session,
    is_current_session: Boolean(session.is_current_session || (storedSessionId && session.session_id === storedSessionId)),
  }))

  if (withStoredCurrent.some((session) => session.is_current_session) || withStoredCurrent.length === 0) {
    return withStoredCurrent
  }

  const newestSessionId = withStoredCurrent.reduce((latest, session) => (
    getSessionTime(session) > getSessionTime(latest) ? session : latest
  ), withStoredCurrent[0]).session_id

  return withStoredCurrent.map((session) => ({
    ...session,
    is_current_session: session.session_id === newestSessionId,
  }))
}

const Sessions = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await authService.listSessions()
      setSessions(getResponseData(response)?.sessions || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Session management is unavailable'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const visibleSessions = useMemo(() => normalizeCurrentSession(sessions), [sessions])

  const revoke = async (sessionId) => {
    setBusy(sessionId)
    setError('')
    try {
      await authService.revokeSession(sessionId)
      setNotice('Session revoked')
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to revoke session'))
    } finally {
      setBusy('')
    }
  }

  const revokeOthers = async () => {
    setBusy('others')
    setError('')
    try {
      await authService.revokeOtherSessions()
      setNotice('Other sessions revoked')
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to revoke other sessions'))
    } finally {
      setBusy('')
    }
  }

  return (
    <section className="account-page">
      <div className="account-header">
        <h1>Sessions</h1>
        <p>Review active logins and revoke access you no longer use.</p>
      </div>

      <div className="account-panel">
        {notice ? <div className="alert alert--success">{notice}</div> : null}
        {error ? <div className="alert alert--error">{error}</div> : null}

        <div className="account-panel__bar">
          <strong>{visibleSessions.length} active sessions</strong>
          <Button className="button button--ghost" disabled={busy === 'others'} onClick={revokeOthers} type="button">
            Revoke other sessions
          </Button>
        </div>

        {loading ? <Loading label="Loading sessions" /> : null}

        {!loading && visibleSessions.length === 0 ? (
          <p className="muted">No active sessions found. Redis session management may be disabled locally.</p>
        ) : null}

        <div className="session-list">
          {visibleSessions.map((session) => (
            <article className={`session-item${session.is_current_session ? ' session-item--current' : ''}`} key={session.session_id}>
              <div className="session-item__main">
                <div className="session-item__icon">
                  <MonitorSmartphone size={20} />
                </div>
                <div>
                  <div className="session-item__title-row">
                    <h2>{session.device_info || 'Unknown device'}</h2>
                    {session.is_current_session ? <span className="session-current">Current</span> : null}
                  </div>
                  <p>{session.ip || 'Unknown IP'}</p>
                  <p>Last active {formatDate(session.last_activity)}</p>
                </div>
              </div>
              <div className="session-item__actions">
                {!session.is_current_session ? (
                  <button
                    aria-label="Revoke session"
                    className="wish-icon-action wish-icon-action--danger"
                    disabled={busy === session.session_id}
                    onClick={() => revoke(session.session_id)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Sessions
