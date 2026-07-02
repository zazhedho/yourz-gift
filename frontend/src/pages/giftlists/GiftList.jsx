import { Copy, Plus, Trash2, Edit2, ChevronRight, CheckCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()

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
    <section style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Centered Header block */}
      <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '30px' }}>
        <h1 style={{ fontSize: '46px', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.03em', color: '#111827' }}>Wish Lists</h1>
        <p style={{ fontSize: '18px', color: 'var(--color-shade-60)', margin: 0 }}>Browse your lists and those shared by friends</p>
      </div>

      {notice ? <div className="alert alert--success">{notice}</div> : null}

      {/* Toolbar: Segmented Controls & New Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="segmented-control">
            <button className="active-pink">My lists</button>
            <button>Friends</button>
          </div>
          <div className="segmented-control">
            <button className="active-dark">Current</button>
            <button>Previous</button>
          </div>
        </div>
        
        <Link to="/app/lists/new" className="button" style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '0 20px', minHeight: '40px' }}>
          <Plus size={18} style={{ marginRight: '6px' }} /> New Wish List
        </Link>
      </div>
      
      {/* List count indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '12px', fontWeight: 700, color: 'var(--color-shade-50)', letterSpacing: '1px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }}></span>
        CURRENT & UPCOMING ({lists.length})
      </div>

      {lists.length === 0 ? (
        <EmptyState
          action={<Link className="button" style={{ background: '#10b981', color: 'white' }} to="/app/lists/new">Create your first list</Link>}
          message="Create a list, add gift items, and share it with your guests."
          title="No gift lists yet"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {lists.map((list) => (
            <article key={list.id} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '24px 32px', 
              borderRadius: '16px',
              background: list.cover_image_url ? `url(${list.cover_image_url}) center/cover` : 'linear-gradient(90deg, #c35c87 0%, #355787 100%)',
              color: 'white',
              boxShadow: 'var(--shadow-md)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 2 }}>
                {/* Circular avatar */}
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid white', background: '#ccc', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <img src={list.cover_image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=150&q=80'} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {list.is_active && (
                    <div style={{ position: 'absolute', bottom: 2, right: 2, background: 'white', borderRadius: '50%' }}>
                      <CheckCircle size={14} color="#10b981" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, textShadow: '0 1px 3px rgba(0,0,0,0.3)', letterSpacing: '-0.02em' }}>{list.title}</h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '15px', opacity: 0.9, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>By You</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                  <button onClick={() => copyLink(list.share_code)} title="Copy Public Link" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <Copy size={16} />
                  </button>
                  <button onClick={() => navigate(`/app/lists/${list.id}/edit`)} title="Edit List" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => remove(list.id)} title="Delete List" style={{ background: 'rgba(244,63,94,0.15)', backdropFilter: 'blur(4px)', border: '1px solid rgba(244,63,94,0.3)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <Trash2 size={16} />
                  </button>
                  <Link to={`/app/lists/${list.id}`} className="button" style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    backdropFilter: 'blur(8px)', 
                    border: '1px solid rgba(255,255,255,0.4)', 
                    color: 'white',
                    borderRadius: '99px',
                    marginLeft: '8px',
                    padding: '0 20px',
                    minHeight: '40px',
                    fontWeight: 500
                  }}>
                    View Wish List <ChevronRight size={18} style={{ marginLeft: '4px' }} />
                  </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <p style={{ textAlign: 'center', color: 'var(--color-shade-40)', marginTop: '48px', fontSize: '15px' }}>You've reached the end</p>
    </section>
  )
}

export default GiftList
