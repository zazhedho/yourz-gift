import { CheckCircle, ChevronRight, Copy, Edit2, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import Loading from '../../components/common/Loading'
import RetryState from '../../components/common/RetryState'
import giftService from '../../services/giftService'
import { getErrorMessage, getListData } from '../../services/api'
import { isGiftListCurrent } from '../../utils/giftDisplay'

const publicUrl = (shareCode) => `${window.location.origin}/g/${shareCode}`

const GiftList = () => {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()
  const [view, setView] = useState(() => (searchParams.get('friends') === '1' ? 'friends' : 'mine'))
  const [status, setStatus] = useState('current')
  const navigate = useNavigate()
  const searchTerm = searchParams.get('search')?.trim() || ''
  const [deleteId, setDeleteId] = useState(null)

  const loadLists = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = searchTerm ? { search: searchTerm } : undefined
      const response = view === 'friends' ? await giftService.listFriendLists(params) : await giftService.listLists(params)
      setLists(getListData(response))
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load gift lists'))
    } finally {
      setLoading(false)
    }
  }, [searchTerm, view])

  useEffect(() => {
    loadLists()
  }, [loadLists])

  useEffect(() => {
    setView(searchParams.get('friends') === '1' ? 'friends' : 'mine')
  }, [searchParams])

  const selectView = (nextView) => {
    setView(nextView)
    const next = new URLSearchParams(searchParams)
    if (nextView === 'friends') next.set('friends', '1')
    else next.delete('friends')
    setSearchParams(next)
  }

  const clearSearch = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('search')
    setSearchParams(next)
  }

  const remove = (id) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    await giftService.deleteList(deleteId)
    setDeleteId(null)
    await loadLists()
  }

  const copyLink = async (shareCode) => {
    await navigator.clipboard.writeText(publicUrl(shareCode))
    setNotice('Public link copied')
    setTimeout(() => setNotice(''), 3000)
  }

  if (loading) return <Loading label="Loading gift lists" />
  if (error) return <RetryState message={error} onRetry={loadLists} />

  const visibleLists = lists.filter((list) => (status === 'current' ? isGiftListCurrent(list) : !isGiftListCurrent(list)))
  const listLabel = view === 'friends' ? 'FRIENDS' : status === 'current' ? 'CURRENT & UPCOMING' : 'PREVIOUS'

  return (
    <section className="wish-page">
      <div className="wish-hero">
        <h1>Wish Lists</h1>
        <p>Browse your lists and those shared by friends</p>
      </div>

      {notice ? createPortal(
        <div className="gift-detail-notice" role="alert">
          <CheckCircle size={18} /> {notice}
        </div>,
        document.body
      ) : null}

      <div className="wish-toolbar">
        <div className="wish-toolbar__segments">
          <div className="segmented-control">
            <button className={view === 'mine' ? 'active-pink' : ''} onClick={() => selectView('mine')} type="button">My lists</button>
            <button className={view === 'friends' ? 'active-pink' : ''} onClick={() => selectView('friends')} type="button">Friends</button>
          </div>
          <div className="segmented-control">
            <button className={status === 'current' ? 'active-dark' : ''} onClick={() => setStatus('current')} type="button">Current</button>
            <button className={status === 'previous' ? 'active-dark' : ''} onClick={() => setStatus('previous')} type="button">Previous</button>
          </div>
        </div>

        <Link to="/lists/new" className="wish-create-button">
          <Plus size={20} /> New Wish List
        </Link>
      </div>

      <div className="wish-section-label">
        <span />
        {listLabel} ({visibleLists.length})
      </div>
      {searchTerm ? (
        <div className="wish-search-chip">
          Search: <strong>{searchTerm}</strong>
          <button onClick={clearSearch} type="button">Clear</button>
        </div>
      ) : null}

      {visibleLists.length === 0 ? (
        <EmptyState
          action={view === 'friends' ? null : <Link className="wish-create-button" to="/lists/new">Create your first list</Link>}
          message={searchTerm ? 'Try another search term.' : view === 'friends' ? 'Accepted friends with active public lists will show here.' : 'Create a list, add gift items, and share it with your guests.'}
          title={view === 'friends' ? 'No friend lists yet' : 'No gift lists yet'}
        />
      ) : (
        <div className="wish-list-stack">
          {visibleLists.map((list) => (
            <article className="wish-list-card" key={list.id}>
              {list.cover_image_url ? <img alt="" className="wish-list-card__cover" src={list.cover_image_url} /> : null}
              <div className="wish-list-card__overlay" />
              <div className="wish-list-card__identity">
                <div className="wish-list-card__avatar">
                  <img alt="" src={list.cover_image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=180&q=80'} />
                  {isGiftListCurrent(list) && (
                    <div className="wish-list-card__badge">
                      <CheckCircle size={14} color="#10b981" />
                    </div>
                  )}
                </div>
                <div className="wish-list-card__text">
                  <h2>{list.title}</h2>
                  <p>{view === 'friends' ? 'By Friend' : 'By You'}</p>
                </div>
              </div>

              <div aria-label={`Actions for ${list.title}`} className="wish-list-card__actions" role="group">
                <button className="wish-icon-action" onClick={() => copyLink(list.share_code)} title="Copy Public Link" type="button">
                  <Copy size={16} />
                </button>
                {view === 'mine' ? (
                  <>
                    <button className="wish-icon-action" onClick={() => navigate(`/lists/${list.id}/edit`)} title="Edit List" type="button">
                      <Edit2 size={16} />
                    </button>
                    <button className="wish-icon-action wish-icon-action--danger" onClick={() => remove(list.id)} title="Delete List" type="button">
                      <Trash2 size={16} />
                    </button>
                  </>
                ) : null}
                <Link className="wish-card-button" to={view === 'friends' ? `/g/${list.share_code}` : `/lists/${list.id}`}>
                  {view === 'friends' ? 'Open Public List' : 'View Wish List'} <ChevronRight size={18} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog 
        open={Boolean(deleteId)} 
        title="Delete Gift List" 
        message="Are you sure you want to delete this gift list? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <p className="wish-end">You've reached the end</p>
    </section>
  )
}

export default GiftList
