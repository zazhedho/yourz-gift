import { ExternalLink, Gift, CheckCircle2, ShoppingBag, Package, Search, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router-dom'

import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import RetryState from '../../components/common/RetryState'
import giftService from '../../services/giftService'
import { getErrorMessage, getListData, getResponseData } from '../../services/api'
import { formatOccasion } from '../../utils/giftDisplay'
import HeroBubbles from '../../components/common/HeroBubbles'
import ReservationForm from './ReservationForm'
import ShippingModal from '../giftlists/ShippingModal'

const formatPrice = (item) => {
  if (item.price === null || item.price === undefined) return ''
  return `${item.currency || 'IDR'} ${Number(item.price).toLocaleString('id-ID')}`
}

const shouldShowReadMore = (value) => {
  const text = String(value || '').trim()
  return text.length > 180 || text.split(/\r?\n/).length > 3
}

const remainingQuantity = (item) => Number(item.quantity_remaining ?? item.quantity ?? 0)

const isItemAvailable = (item) => item.can_reserve !== false && remainingQuantity(item) > 0

const PublicGiftList = () => {
  const { code } = useParams()
  const [list, setList] = useState(null)
  const [items, setItems] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showDescription, setShowDescription] = useState(false)
  const [showShipping, setShowShipping] = useState(false)

  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('preferred')

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

  const filteredItems = items
    .filter((item) => {
      if (!search) return true
      const s = search.toLowerCase()
      return item.name?.toLowerCase().includes(s) || item.description?.toLowerCase().includes(s)
    })
    .sort((a, b) => {
      const availabilityOrder = Number(isItemAvailable(b)) - Number(isItemAvailable(a))
      if (availabilityOrder !== 0) return availabilityOrder
      if (sortBy === 'price-asc') return Number(a.price || 0) - Number(b.price || 0)
      if (sortBy === 'price-desc') return Number(b.price || 0) - Number(a.price || 0)
      if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      return Number(a.priority || 0) - Number(b.priority || 0)
    })

  const availableItems = items.filter(isItemAvailable).length
  const showReadMore = shouldShowReadMore(list.description)

  return (
    <>
      <div className="gift-detail-hero">
        {list.cover_image_url ? (
          <div className="gift-detail-hero__bg" style={{ backgroundImage: `url(${list.cover_image_url})` }} />
        ) : null}
        <HeroBubbles />
        <div className="gift-detail-hero__content">
          <div className="gift-detail-hero__copy">
            <span className="gift-detail-hero__eyebrow">{formatOccasion(list.occasion_type)}</span>
            <h1>{list.title}</h1>
            <p>{list.description || 'Choose a gift and reserve it for the owner.'}</p>
            {showReadMore ? (
              <button className="gift-detail-description-button" onClick={() => setShowDescription(true)} type="button">
                Read more
              </button>
            ) : null}
          </div>
          <div className="gift-detail-hero__media">
            {list.cover_image_url ? <img alt="" src={list.cover_image_url} /> : <Gift size={64} />}
          </div>
        </div>
        <div className="gift-detail-hero__wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M0,82 C220,108 420,108 650,90 C890,72 1055,68 1240,74 C1330,77 1395,82 1440,78 L1440,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      <section className="gift-detail-page gift-detail-page--public">
        <div className="gift-detail-stats">
          <div>
            <span>AVAILABLE ITEMS</span>
            <strong>{availableItems}</strong>
          </div>
          <div>
            <span>TOTAL ITEMS</span>
            <strong>{items.length}</strong>
          </div>
          <div>
            <span>SHIPPING ADDRESS</span>
            <button onClick={() => setShowShipping(true)} type="button">View</button>
          </div>
        </div>

        <div className="gift-detail-controls">
          <label>
            Search
            <div className="gift-detail-search">
              <Search size={18} color="#9ca3af" />
              <input 
                placeholder="E.g. bunny toy" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </label>

          <label>
            Sort by
            <select 
              className="gift-detail-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="preferred">Preferred</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </div>

        {notice ? (
          <div className="gift-detail-notice">
            <CheckCircle2 size={18} color="#10b981" /> <strong>{notice}</strong>
          </div>
        ) : null}

        {filteredItems.length === 0 ? (
          <div className="gift-detail-empty">
            <Package size={48} color="#94a3b8" />
            <h2>No items found</h2>
            <p>{search ? 'Change the search term.' : 'The owner has not added public gift items yet.'}</p>
          </div>
        ) : (
          <div className="gift-detail-items">
            {filteredItems.map((item) => {
              const remaining = remainingQuantity(item)
              const canReserve = isItemAvailable(item)
              
              return (
                <div className="gift-detail-item" key={item.id}>
                  <div className="gift-detail-item__status" style={{ background: canReserve ? '#10b981' : '#64748b' }}>
                    <div className="gift-detail-item__status-text">
                      <Gift size={16} /> 
                      {canReserve ? `${remaining} remaining` : 'Fully reserved'}
                    </div>
                  </div>

                  <div className="gift-detail-item__body">
                    <div className="gift-detail-item__main" style={{ gridTemplateColumns: '84px minmax(0, 1fr)' }}>
                      <div className="gift-detail-item__image">
                        {item.image_url ? (
                          <img alt={item.name} src={item.image_url} />
                        ) : (
                          <Package size={40} color="#94a3b8" />
                        )}
                      </div>
                      <div className="gift-detail-item__text">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>{item.name}</h2>
                          {item.price && <div className="gift-detail-item__price" style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#10b981' }}>{formatPrice(item)}</div>}
                        </div>
                        <p style={{ margin: '8px 0 16px', fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>{item.description || item.name}</p>
                        
                        {item.product_url ? (
                          <a className="gift-detail-online" href={item.product_url} rel="noreferrer" target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#334155', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
                            View online <ExternalLink size={14} />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  
                  <div className="gift-detail-item__footer">
                    <div></div>
                    <Button 
                      disabled={!canReserve} 
                      onClick={() => setSelectedItem(item)}
                      style={{ 
                        background: canReserve ? '#10b981' : '#e2e8f0', 
                        color: canReserve ? 'white' : '#64748b',
                        border: 'none',
                        minHeight: '44px',
                        padding: '0 24px',
                        borderRadius: '99px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: canReserve ? 'pointer' : 'not-allowed'
                      }}
                    >
                      <ShoppingBag size={18} /> {canReserve ? 'Reserve' : 'Reserved'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {selectedItem ? (
        <ReservationForm
          code={code}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onReserved={reserved}
        />
      ) : null}

      {showShipping && (
        <ShippingModal note={list.shipping_note} onClose={() => setShowShipping(false)} />
      )}

      {showDescription && createPortal(
        <div className="dialog-backdrop" role="presentation" style={{ zIndex: 9999 }}>
          <div className="dialog gift-description-dialog" role="dialog" aria-modal="true" aria-label="Gift list description">
            <div className="gift-description-dialog__header">
              <div>
                <span>{formatOccasion(list.occasion_type)}</span>
                <h2>{list.title}</h2>
              </div>
              <button aria-label="Close description" onClick={() => setShowDescription(false)} type="button">
                <X size={18} />
              </button>
            </div>
            <div className="gift-description-dialog__body">
              <p>{list.description}</p>
            </div>
            <div className="gift-description-dialog__footer">
              <button onClick={() => setShowDescription(false)} type="button">Close</button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

export default PublicGiftList
