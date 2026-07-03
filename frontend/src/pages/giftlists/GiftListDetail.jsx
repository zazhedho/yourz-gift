import { CheckCircle2, Copy, Edit2, Package, Plus, Tag, Trash2, Users } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'

import Loading from '../../components/common/Loading'
import RetryState from '../../components/common/RetryState'
import giftService from '../../services/giftService'
import { getErrorMessage, getListData, getResponseData } from '../../services/api'

const GiftListDetail = () => {
  const { listId } = useParams()
  const navigate = useNavigate()
  const [list, setList] = useState(null)
  const [items, setItems] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [listResponse, itemResponse, reservationResponse] = await Promise.all([
        giftService.getList(listId),
        giftService.listItems(listId),
        giftService.listReservations(listId),
      ])
      setList(getResponseData(listResponse))
      setItems(getListData(itemResponse))
      setReservations(getListData(reservationResponse))
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load gift list detail'))
    } finally {
      setLoading(false)
    }
  }, [listId])

  useEffect(() => {
    load()
  }, [load])

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/g/${list.share_code}`)
    setNotice('Public link copied')
    setTimeout(() => setNotice(''), 3000)
  }

  const deleteItem = async (itemId) => {
    if (!window.confirm('Delete this item?')) return
    await giftService.deleteItem(itemId)
    await load()
  }

  const editItem = (item) => {
    navigate(`/app/items/${item.id}/edit`, { state: { item, listId } })
  }

  if (loading) return <Loading label="Loading gift list detail" />
  if (error) return <RetryState message={error} onRetry={load} />
  if (!list) return <RetryState message="Gift list not found" onRetry={load} />

  return (
    <section style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' }}>
      
      {/* Immersive Header */}
      <div style={{ 
        position: 'relative', 
        borderRadius: 'var(--radius-xl)', 
        overflow: 'hidden',
        marginBottom: '40px',
        background: list.cover_image_url ? `url(${list.cover_image_url}) center/cover` : 'linear-gradient(135deg, #f43f5e 0%, #3b82f6 100%)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)',
          padding: '60px 40px 40px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: 600, letterSpacing: '0.5px' }}>
                {list.occasion_type?.replace('_', ' ').toUpperCase() || 'EVENT'}
              </span>
              {list.is_active && (
                <span style={{ background: '#10b981', padding: '4px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Active
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '42px', fontWeight: 800, margin: '0 0 12px 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{list.title}</h1>
            <p style={{ fontSize: '18px', opacity: 0.9, maxWidth: '600px', margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{list.description || 'No description provided'}</p>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginTop: '16px' }}>
            <div style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', padding: '12px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ opacity: 0.7, fontSize: '14px' }}>Share Code:</span>
              <strong style={{ fontSize: '18px', letterSpacing: '1px' }}>{list.share_code}</strong>
              <button onClick={copyLink} style={{ background: 'white', color: 'black', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginLeft: '8px' }} title="Copy Link">
                <Copy size={14} />
              </button>
            </div>
            
            <Link to={`/app/lists/${listId}/edit`} className="button" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', minHeight: '48px', borderRadius: '12px' }}>
              <Edit2 size={16} style={{ marginRight: '6px' }} /> Edit List
            </Link>
          </div>
        </div>
      </div>

      {notice && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#059669', padding: '16px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', fontWeight: 600 }}>
          <CheckCircle2 size={20} /> {notice}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Column: Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={24} color="var(--color-primary)" />
              Gift Items <span style={{ background: 'var(--color-surface-hover)', padding: '2px 10px', borderRadius: '99px', fontSize: '14px', color: 'var(--color-shade-50)' }}>{items.length}</span>
            </h2>
            <Link className="button" to={`/app/lists/${listId}/items/new`} style={{ background: 'var(--color-primary)', color: 'white', borderRadius: '99px', padding: '0 20px', minHeight: '40px' }}>
              <Plus size={18} style={{ marginRight: '4px' }} /> Add Item
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="surface" style={{ padding: '48px 32px', textAlign: 'center', borderRadius: 'var(--radius-xl)' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--color-surface-hover)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Package size={32} color="var(--color-shade-40)" />
              </div>
              <h3 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>No items yet</h3>
              <p className="muted" style={{ margin: '0 0 24px 0' }}>Guests need visible items before they can reserve.</p>
              <Link className="button" to={`/app/lists/${listId}/items/new`} style={{ background: 'var(--color-primary)', color: 'white' }}>Add first item</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {items.map((item) => (
                <article key={item.id} style={{ 
                  display: 'flex', 
                  background: 'rgba(255, 255, 255, 0.6)', 
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.8)',
                  borderRadius: '20px', 
                  padding: '16px',
                  gap: '20px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }} className="item-card">
                  
                  <div style={{ 
                    width: '100px', 
                    height: '100px', 
                    borderRadius: '12px', 
                    background: item.image_url ? `url(${item.image_url}) center/cover` : 'var(--color-surface-hover)',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {!item.image_url && <Package size={32} color="var(--color-shade-30)" />}
                  </div>
                  
                  <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 600 }}>{item.name}</h3>
                        {!item.is_active && (
                          <span style={{ fontSize: '11px', background: 'var(--color-shade-10)', padding: '2px 8px', borderRadius: '4px', color: 'var(--color-shade-50)', fontWeight: 600 }}>INACTIVE</span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-shade-50)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description || 'No description'}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)', fontWeight: 700 }}>
                        <Tag size={16} /> {item.currency || 'IDR'} {item.price ?? '-'}
                        <span style={{ color: 'var(--color-shade-40)', fontWeight: 500, fontSize: '13px', marginLeft: '4px' }}>&times; {item.quantity}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => editItem(item)} style={{ background: 'white', border: '1px solid var(--color-hairline)', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-ink)' }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteItem(item.id)} style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#e11d48' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Reservations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} color="var(--color-primary)" />
            Reservations <span style={{ background: 'var(--color-surface-hover)', padding: '2px 10px', borderRadius: '99px', fontSize: '14px', color: 'var(--color-shade-50)' }}>{reservations.length}</span>
          </h2>

          <div className="surface" style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
            {reservations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Users size={32} color="var(--color-shade-30)" style={{ margin: '0 auto 12px' }} />
                <p className="muted" style={{ margin: 0 }}>No guests have reserved items yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reservations.map((reservation) => (
                  <div key={reservation.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '16px',
                    background: 'var(--color-surface-hover)',
                    borderRadius: '12px'
                  }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '16px', marginBottom: '2px' }}>{reservation.guest_name || reservation.guest_email}</strong>
                      <div style={{ fontSize: '13px', color: 'var(--color-shade-50)' }}>{reservation.item_name || reservation.item_id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>Qty: {reservation.quantity}</div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', marginTop: '2px' }}>{reservation.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .item-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.06) !important;
        }
      `}} />
    </section>
  )
}

export default GiftListDetail
