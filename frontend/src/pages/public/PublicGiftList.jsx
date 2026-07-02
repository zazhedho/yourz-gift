import { ExternalLink, Gift, MapPin, Calendar, CheckCircle2, ShoppingBag } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import Loading from '../../components/common/Loading'
import RetryState from '../../components/common/RetryState'
import giftService from '../../services/giftService'
import { getErrorMessage, getListData, getResponseData } from '../../services/api'
import { formatOccasion } from '../../utils/giftDisplay'
import ReservationForm from './ReservationForm'

const formatPrice = (item) => {
  if (item.price === null || item.price === undefined) return ''
  return `${item.currency || 'IDR'} ${Number(item.price).toLocaleString('id-ID')}`
}

const PublicGiftList = () => {
  const { code } = useParams()
  const [list, setList] = useState(null)
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [listResponse, itemResponse] = await Promise.all([
        giftService.getPublicList(code),
        giftService.listPublicItems(code),
      ])
      setList(getResponseData(listResponse))
      setItems(getListData(itemResponse))
    } catch (err) {
      setError(getErrorMessage(err, 'Gift list is unavailable'))
    } finally {
      setLoading(false)
    }
  }, [code])

  useEffect(() => {
    load()
  }, [load])

  const reserved = async () => {
    setSelectedItem(null)
    setNotice('Gift reserved. Thank you.')
    await load()
  }

  if (loading) return <Loading label="Loading gift list" />
  if (error) return <RetryState message={error} onRetry={load} />
  if (!list) return <RetryState message="Gift list not found" onRetry={load} />

  return (
    <main className="public-page" style={{ position: 'relative', zIndex: 1, padding: 0, maxWidth: '100%' }}>
      {/* Immersive Hero Section */}
      <section style={{ 
        position: 'relative', 
        minHeight: '60vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '60px 24px',
        overflow: 'hidden'
      }}>
        {/* Background Blur Image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: list.cover_image_url ? `url(${list.cover_image_url}) center/cover` : 'var(--gradient-main)',
          filter: 'blur(30px)',
          transform: 'scale(1.1)',
          opacity: 0.4,
          zIndex: -1
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent, var(--color-canvas-night))',
          zIndex: -1
        }} />

        <div style={{ 
          maxWidth: '800px', 
          width: '100%', 
          textAlign: 'center',
          animation: 'fadeIn 0.8s ease-out'
        }}>
          {list.cover_image_url && (
            <div style={{ 
              width: '120px', height: '120px', margin: '0 auto 24px', 
              borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)', 
              overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              <img src={list.cover_image_url} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '6px 16px', borderRadius: '99px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Calendar size={16} color="var(--color-primary)" />
            <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>{formatOccasion(list.occasion_type)}</span>
          </div>
          
          <h1 className="public-title" style={{ fontSize: 'clamp(48px, 8vw, 80px)', textShadow: '0 4px 12px rgba(0,0,0,0.3)', marginBottom: '24px' }}>{list.title}</h1>
          
          <p style={{ fontSize: '20px', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '0 auto 24px' }}>
            {list.description || 'Choose a gift and reserve it for the owner.'}
          </p>
          
          {list.shipping_note && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)', padding: '12px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <MapPin size={20} color="var(--color-primary)" />
              <span style={{ fontSize: '15px', color: 'rgba(255,255,255,0.9)' }}>{list.shipping_note}</span>
            </div>
          )}
        </div>
      </section>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>
        {notice ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <CheckCircle2 size={24} /> <span style={{ fontWeight: 600 }}>{notice}</span>
          </div>
        ) : null}

        {items.length === 0 ? (
          <EmptyState message="The owner has not added public gift items yet." title="No gifts yet" />
        ) : (
          <section className="public-items" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
            {items.map((item) => {
              const remaining = item.quantity_remaining ?? item.quantity
              const canReserve = item.can_reserve !== false && remaining > 0
              return (
                <article key={item.id} style={{ 
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  display: 'flex',
                  flexDirection: 'column'
                }} className="gift-card-hover">
                  
                  <div style={{ 
                    height: '220px', 
                    background: item.image_url ? `url(${item.image_url}) center/cover` : 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}>
                    {!item.image_url && <Gift size={48} color="rgba(255,255,255,0.2)" />}
                    <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 700, color: canReserve ? 'white' : '#94a3b8' }}>
                      {remaining} remaining
                    </div>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <h2 style={{ fontSize: '20px', margin: '0 0 8px 0', fontWeight: 600 }}>{item.name}</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0 0 16px 0' }}>
                      {item.description || 'No description'}
                    </p>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>{formatPrice(item)}</p>
                      
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {item.product_url && (
                          <a href={item.product_url} target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}>
                            <ExternalLink size={18} />
                          </a>
                        )}
                        <Button 
                          disabled={!canReserve} 
                          onClick={() => setSelectedItem(item)}
                          style={{ 
                            background: canReserve ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)', 
                            color: canReserve ? 'white' : 'rgba(255,255,255,0.4)',
                            border: 'none',
                            minHeight: '44px',
                            padding: '0 20px',
                            borderRadius: '99px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <ShoppingBag size={18} /> {canReserve ? 'Reserve' : 'Reserved'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>

      {selectedItem ? (
        <ReservationForm
          code={code}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onReserved={reserved}
        />
      ) : null}

      <style dangerouslySetInnerHTML={{__html: `
        .gift-card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          border-color: rgba(255,255,255,0.2) !important;
        }
      `}} />
    </main>
  )
}

export default PublicGiftList
