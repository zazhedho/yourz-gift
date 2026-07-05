import { Check, MailPlus, Search, Trash2, UserRound, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import giftService from '../../services/giftService'
import { getErrorMessage, getListData } from '../../services/api'

const friendName = (friend) => friend.name || friend.email || 'Friend'

const Friends = () => {
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [email, setEmail] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [friendsResponse, requestsResponse] = await Promise.all([
        giftService.listFriends(search ? { search } : undefined),
        giftService.listFriendRequests(),
      ])
      setFriends(getListData(friendsResponse))
      setRequests(getListData(requestsResponse))
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load friends'))
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    load()
  }, [load])

  const visibleFriends = useMemo(() => friends, [friends])

  const submitRequest = async (event) => {
    event.preventDefault()
    if (!email.trim()) return
    setBusy('request')
    setError('')
    try {
      await giftService.requestFriend({ email: email.trim() })
      setEmail('')
      setNotice('Friend request sent')
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to send friend request'))
    } finally {
      setBusy('')
    }
  }

  const accept = async (friend) => {
    setBusy(`accept-${friend.id}`)
    setError('')
    try {
      await giftService.acceptFriend(friend.id)
      setNotice('Friend request accepted')
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to accept request'))
    } finally {
      setBusy('')
    }
  }

  const reject = async (friend) => {
    setBusy(`reject-${friend.id}`)
    setError('')
    try {
      await giftService.rejectFriend(friend.id)
      setNotice('Friend request rejected')
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reject request'))
    } finally {
      setBusy('')
    }
  }

  const remove = async (friend) => {
    setBusy(`delete-${friend.id}`)
    setError('')
    try {
      await giftService.deleteFriend(friend.id)
      setNotice('Friend removed')
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to remove friend'))
    } finally {
      setBusy('')
    }
  }

  return (
    <section className="friends-page">
      <header className="friends-page__header">
        <h1>Friends</h1>
        <p>Manage who can share gift lists with you.</p>
      </header>

      <div className="friends-layout">
        <section className="friends-panel friends-panel--request" style={{ background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)', borderColor: '#99f6e4' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>
            <div style={{ background: 'linear-gradient(135deg, #14b8a6, #0f766e)', color: 'white', padding: '12px', borderRadius: '16px', boxShadow: '0 8px 16px rgba(13, 148, 136, 0.25)' }}>
              <MailPlus size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#115e59', margin: '0 0 2px', letterSpacing: '-0.5px' }}>Invite a Friend</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#0f766e', lineHeight: 1.4, fontWeight: 500 }}>Share your wish lists securely</p>
            </div>
          </div>
          <form className="friends-add-form" onSubmit={submitRequest} style={{ gridTemplateColumns: '1fr', gap: '12px' }}>
            <div className="friends-input" style={{ background: 'white', border: '1px solid #99f6e4', boxShadow: '0 4px 12px rgba(13, 148, 136, 0.08)', height: '48px', padding: '0 16px' }}>
              <input
                aria-label="Friend email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter their email address..."
                type="email"
                value={email}
                style={{ color: '#115e59', fontSize: '15px', fontWeight: 500 }}
              />
            </div>
            <Button disabled={busy === 'request'} isLoading={busy === 'request'} type="submit" style={{ background: '#0f766e', color: 'white', border: 'none', borderRadius: '999px', height: '44px', fontWeight: 700, fontSize: '15px', boxShadow: '0 4px 12px rgba(15, 118, 110, 0.2)' }}>
              Send Invitation
            </Button>
          </form>
          {notice ? <div className="alert alert--success" style={{ margin: 0 }}>{notice}</div> : null}
          {error ? <div className="alert alert--error" style={{ margin: 0 }}>{error}</div> : null}
        </section>

        <section className="friends-panel">
          <div className="friends-panel__bar">
            <div>
              <h2>Pending requests</h2>
              <p>{requests.length} waiting</p>
            </div>
          </div>
          {loading ? <Loading label="Loading friends" /> : null}
          {!loading && requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 20px', background: 'rgba(248, 250, 252, 0.5)', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <div style={{ background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', color: '#64748b', width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)' }}>
                <Check size={28} strokeWidth={2.5} />
              </div>
              <h3 style={{ color: '#334155', fontSize: '16px', margin: '0 0 4px', fontWeight: 700 }}>All caught up!</h3>
              <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>No pending friend requests.</p>
            </div>
          ) : null}
          <div className="friends-list">
            {requests.map((friend) => (
              <article className="friend-card" key={friend.id}>
                <div className="friend-card__avatar"><UserRound size={20} /></div>
                <div className="friend-card__body">
                  <h3>{friendName(friend)}</h3>
                  <p>{friend.email}</p>
                </div>
                <div className="friend-card__actions">
                  <button aria-label={`Accept ${friendName(friend)}`} className="wish-icon-action" disabled={busy === `accept-${friend.id}`} onClick={() => accept(friend)} type="button">
                    <Check size={16} />
                  </button>
                  <button aria-label={`Reject ${friendName(friend)}`} className="wish-icon-action wish-icon-action--danger" disabled={busy === `reject-${friend.id}`} onClick={() => reject(friend)} type="button">
                    <X size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="friends-panel friends-panel--wide">
          <div className="friends-panel__bar">
            <div>
              <h2>Your friends</h2>
              <p>{visibleFriends.length} connected</p>
            </div>
            <div className="friends-search">
              <Search size={16} />
              <input aria-label="Search friends" onChange={(event) => setSearch(event.target.value)} placeholder="Search friends" value={search} />
            </div>
          </div>
          {!loading && visibleFriends.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(248, 250, 252, 0.5)', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <div style={{ background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', color: '#4f46e5', width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(79, 70, 229, 0.15)' }}>
                <UserRound size={36} strokeWidth={2.5} />
              </div>
              <h3 style={{ color: '#1e293b', fontSize: '18px', margin: '0 0 8px', fontWeight: 800 }}>No friends yet</h3>
              <p style={{ color: '#64748b', fontSize: '15px', margin: 0, lineHeight: 1.5 }}>Add friends using their email address<br />to start sharing gift lists.</p>
            </div>
          ) : null}
          <div className="friends-list">
            {visibleFriends.map((friend) => (
              <article className="friend-card" key={friend.id}>
                <div className="friend-card__avatar"><UserRound size={20} /></div>
                <div className="friend-card__body">
                  <h3>{friendName(friend)}</h3>
                  <p>{friend.email}</p>
                </div>
                <div className="friend-card__actions">
                  <button aria-label={`Remove ${friendName(friend)}`} className="wish-icon-action wish-icon-action--danger" disabled={busy === `delete-${friend.id}`} onClick={() => remove(friend)} type="button">
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

export default Friends
