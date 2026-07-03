import { MonitorSmartphone, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

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
          <strong>{sessions.length} active sessions</strong>
          <Button className="button button--ghost" disabled={busy === 'others'} onClick={revokeOthers} type="button">
            Revoke other sessions
          </Button>
        </div>

        {loading ? <Loading label="Loading sessions" /> : null}

        {!loading && sessions.length === 0 ? (
          <p className="muted">No active sessions found. Redis session management may be disabled locally.</p>
        ) : null}

        <div className="session-list">
          {sessions.map((session) => (
            <article className="session-item" key={session.session_id}>
              <div className="session-item__icon">
                <MonitorSmartphone size={20} />
              </div>
              <div>
                <h2>{session.device_info || 'Unknown device'}</h2>
                <p>{session.ip || 'Unknown IP'}</p>
                <p>Last active {formatDate(session.last_activity)}</p>
              </div>
              <div className="session-item__actions">
                {session.is_current_session ? <span className="session-current">Current</span> : null}
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
