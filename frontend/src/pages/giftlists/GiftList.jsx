import { Copy, ExternalLink, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'

import EmptyState from '../../components/common/EmptyState'
import Loading from '../../components/common/Loading'
import RetryState from '../../components/common/RetryState'
import giftService from '../../services/giftService'
import { getErrorMessage, getListData } from '../../services/api'

const publicUrl = (shareCode) => `${window.location.origin}/g/${shareCode}`

const GiftList = () => {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadLists = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await giftService.listLists()
      setLists(getListData(response))
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load gift lists'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLists()
  }, [loadLists])

  const remove = async (id) => {
    if (!window.confirm('Delete this gift list?')) return
    await giftService.deleteList(id)
    await loadLists()
  }

  const copyLink = async (shareCode) => {
    await navigator.clipboard.writeText(publicUrl(shareCode))
    setNotice('Public link copied')
  }

  if (loading) return <Loading label="Loading gift lists" />
  if (error) return <RetryState message={error} onRetry={loadLists} />

  return (
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gift lists</h1>
          <p className="page-subtitle">Create reusable gift lists, share public links, and track reservations.</p>
        </div>
        <Link className="button button--primary" to="/app/lists/new"><Plus size={16} /> New list</Link>
      </div>
      {notice ? <div className="alert alert--success">{notice}</div> : null}
      {lists.length === 0 ? (
        <EmptyState
          action={<Link className="button button--primary" to="/app/lists/new">Create first list</Link>}
          message="Create a list, add items, then share it with guests."
          title="No gift lists yet"
        />
      ) : (
        <div className="grid grid--cards">
          {lists.map((list) => (
            <article className="card" key={list.id}>
              <div>
                <h2 className="card__title">{list.title}</h2>
                <p className="meta">{list.occasion_type || 'custom'} - {list.is_active ? 'active' : 'inactive'}</p>
              </div>
              <p className="muted">{list.description || 'No description'}</p>
              <p className="meta">Share code: <strong>{list.share_code}</strong></p>
              <div className="actions">
                <Link className="button button--primary button--compact" to={`/app/lists/${list.id}`}>Open</Link>
                <Link className="button button--ghost button--compact" to={`/app/lists/${list.id}/edit`}>Edit</Link>
                <button className="button button--ghost button--compact" onClick={() => copyLink(list.share_code)} type="button">
                  <Copy size={14} /> Copy
                </button>
                <a className="button button--ghost button--compact" href={`/g/${list.share_code}`} target="_blank" rel="noreferrer">
                  <ExternalLink size={14} /> Public
                </a>
                <button className="button button--danger button--compact" onClick={() => remove(list.id)} type="button">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default GiftList
