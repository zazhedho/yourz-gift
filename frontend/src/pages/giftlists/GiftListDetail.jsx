import {
  Archive,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ExternalLink,
  Globe,
  Package,
  Search,
  Settings,
  Share2,
  X,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import Loading from '../../components/common/Loading'
import RetryState from '../../components/common/RetryState'
import giftService from '../../services/giftService'
import { getErrorMessage, getListData, getResponseData } from '../../services/api'
import { formatOccasion } from '../../utils/giftDisplay'
import HeroBubbles from '../../components/common/HeroBubbles'
import ShippingModal from './ShippingModal'
import ReservationsModal from './ReservationsModal'
import useAuth from '../../hooks/useAuth'

const publicUrl = (shareCode) => `${window.location.origin}/g/${shareCode}`

const formatPrice = (item) => {
  if (item.price === null || item.price === undefined) return ''
  return `${item.currency || 'IDR'} ${Number(item.price).toLocaleString('id-ID')}`
}

const sourceHost = (url) => {
  if (!url) return ''
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return ''
  }
}

const reservationQuantity = (reservations, itemId) =>
  reservations
    .filter((reservation) => reservation.item_id === itemId)
    .reduce((total, reservation) => total + Number(reservation.quantity || 0), 0)

const shouldShowReadMore = (value) => {
  const text = String(value || '').trim()
  return text.length > 180 || text.split(/\r?\n/).length > 3
}

const GiftListDetail = () => {
  const auth = useAuth()
  const { listId } = useParams()
  const navigate = useNavigate()
  const [list, setList] = useState(null)
  const [items, setItems] = useState([])
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showDescription, setShowDescription] = useState(false)
  const [showShipping, setShowShipping] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('preferred')
  const [expandedItemId, setExpandedItemId] = useState('')

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
    await navigator.clipboard.writeText(publicUrl(list.share_code))
    setNotice('Public link copied')
    setTimeout(() => setNotice(''), 3000)
  }

  const archiveItem = async (item) => {
    await giftService.updateItem(item.id, { is_archived: true })
    setNotice('Item archived')
    await load()
  }

  const reorderItem = async (itemId, direction) => {
    const currentIndex = items.findIndex((item) => item.id === itemId)
    const nextIndex = currentIndex + direction
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) return

    const nextItems = [...items]
    const [moved] = nextItems.splice(currentIndex, 1)
    nextItems.splice(nextIndex, 0, moved)
    const payload = {
      items: nextItems.map((item, index) => ({ id: item.id, priority: index })),
    }

    setItems(nextItems.map((item, index) => ({ ...item, priority: index })))
    try {
      await giftService.reorderItems(listId, payload)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to reorder item'))
      await load()
    }
  }

  const editItem = (item) => {
    navigate(`/app/items/${item.id}/edit`, { state: { item, listId } })
  }

  const visibleItems = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    const filtered = keyword
      ? items.filter((item) =>
          [item.name, item.description, sourceHost(item.product_url)]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(keyword)),
        )
      : items

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price_asc') return Number(a.price || 0) - Number(b.price || 0)
      if (sortBy === 'price_desc') return Number(b.price || 0) - Number(a.price || 0)
      if (sortBy === 'name') return String(a.name).localeCompare(String(b.name))
      if (sortBy === 'reserved') return reservationQuantity(reservations, b.id) - reservationQuantity(reservations, a.id)
      return Number(a.priority || 0) - Number(b.priority || 0)
    })
  }, [items, reservations, search, sortBy])

  if (loading) return <Loading label="Loading gift list detail" />
  if (error) return <RetryState message={error} onRetry={load} />
  if (!list) return <RetryState message="Gift list not found" onRetry={load} />

  const availableItems = items.filter((item) => item.quantity_remaining !== 0 && item.is_active !== false && item.is_archived !== true).length
  const reservedItems = reservations.length
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
            <p>{list.description || 'Share this list with friends and family so they can reserve the right gift.'}</p>
            {showReadMore ? (
              <button className="gift-detail-description-button" onClick={() => setShowDescription(true)} type="button">
                Read more
              </button>
            ) : null}
            <div className="gift-detail-owner">
              <div className="gift-detail-owner__avatar">
                {auth.user?.avatar_url ? (
                  <img alt="" src={auth.user.avatar_url} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  String(auth.user?.name || auth.user?.email || 'Y').charAt(0).toUpperCase()
                )}
              </div>
              <span>Created by You</span>
            </div>
          </div>
          <div className="gift-detail-hero__media">
            {list.cover_image_url ? <img alt="" src={list.cover_image_url} /> : <Package size={64} />}
          </div>
        </div>
        <div className="gift-detail-hero__wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M0,82 C220,108 420,108 650,90 C890,72 1055,68 1240,74 C1330,77 1395,82 1440,78 L1440,120 L0,120 Z"></path>
          </svg>
        </div>
      </div>

      <section className="gift-detail-page gift-detail-page--owner">
        <div className="gift-detail-stats">
        <div>
          <span>AVAILABLE ITEMS</span>
          <strong>{availableItems}</strong>
        </div>
        <div>
          <span>ITEMS RESERVED</span>
          <strong>{reservedItems}</strong>
        </div>
        <div>
          <span>SHIPPING ADDRESS</span>
          <button onClick={() => setShowShipping(true)} type="button">View</button>
        </div>
      </div>

      {notice ? createPortal(
        <div className="gift-detail-notice" role="alert">
          <CheckCircle2 size={18} /> {notice}
        </div>,
        document.body
      ) : null}

      <div className="gift-detail-controls">
        <label>
          <span>Search</span>
          <div className="gift-detail-search">
            <Search size={16} />
            <input aria-label="Search" onChange={(event) => setSearch(event.target.value)} placeholder="E.g. bunny toy" value={search} />
          </div>
        </label>
        <label>
          <span>Sort by</span>
          <select aria-label="Sort by" className="gift-detail-sort" onChange={(event) => setSortBy(event.target.value)} value={sortBy}>
            <option value="preferred">Preferred</option>
            <option value="reserved">Reserved first</option>
            <option value="price_asc">Price low to high</option>
            <option value="price_desc">Price high to low</option>
            <option value="name">Name</option>
          </select>
        </label>
      </div>

      <div className="gift-detail-items">
        {visibleItems.length === 0 ? (
          <div className="gift-detail-empty">
            <Package size={32} />
            <h2>No items found</h2>
            <p>Add gift items or change the search term.</p>
            <Link className="button button--primary" to={`/app/lists/${listId}/items/new`}>Add item</Link>
          </div>
        ) : (
          visibleItems.map((item) => {
            const itemIndex = items.findIndex((currentItem) => currentItem.id === item.id)
            const itemReservations = reservations.filter((reservation) => reservation.item_id === item.id)
            const reservedQty = reservationQuantity(reservations, item.id)
            const receivedInFull = Number(item.quantity_remaining) === 0 || (item.quantity && reservedQty >= item.quantity)
            const host = sourceHost(item.product_url)
            return (
              <article className="gift-detail-item gift-detail-item--owner" key={item.id}>
                <div className="gift-detail-item__status">
                  <div className="gift-detail-item__status-text">
                    <CheckCircle2 size={16} /> 
                    <span>
                      You have {itemReservations.length} active reservation{itemReservations.length === 1 ? '' : 's'} &bull; {receivedInFull ? 'Item received in full' : `${Math.max(Number(item.quantity_remaining ?? item.quantity ?? 0), 0)} still available`}
                    </span>
                  </div>
                  <button onClick={() => archiveItem(item)} type="button"><Archive size={14} /> Archive item</button>
                </div>

                <div className="gift-detail-item__body">
                  <div className="gift-detail-item__source">{host ? <><Globe size={12} /> {host}</> : <><Package size={12} /> manual item</>}</div>
                  <div className="gift-detail-item__main">
                    <div className="gift-detail-item__image">
                      {item.image_url ? <img alt="" src={item.image_url} /> : <Package size={24} />}
                    </div>
                    <div className="gift-detail-item__text">
                      <h2>{item.name} {item.product_url ? <a href={item.product_url} rel="noreferrer" target="_blank" style={{ color: '#9ca3af', marginLeft: '4px' }}><ExternalLink size={16} /></a> : null}</h2>
                      <div className="gift-detail-item__price">
                        {formatPrice(item)}
                        {receivedInFull ? <span>Item received in full</span> : null}
                      </div>
                      <p>{item.description || item.name}</p>
                      
                      {item.product_url ? (
                        <a className="gift-detail-online" href={item.product_url} rel="noreferrer" target="_blank" style={{ marginTop: '8px', textDecoration: 'none' }}>
                          View online <ExternalLink size={14} />
                        </a>
                      ) : null}
                    </div>
                    
                    <div className="gift-detail-item__reorder" aria-label={`Reorder ${item.name}`}>
                      <button aria-label={`Move ${item.name} up`} disabled={itemIndex <= 0} onClick={() => reorderItem(item.id, -1)} type="button">
                        <ArrowUp size={14} />
                      </button>
                      <button aria-label={`Move ${item.name} down`} disabled={itemIndex === items.length - 1} onClick={() => reorderItem(item.id, 1)} type="button">
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="gift-detail-item__footer">
                  <div>
                    <button onClick={() => editItem(item)} type="button">Edit</button>
                  </div>
                  <button onClick={() => setExpandedItemId(item.id)} type="button" className="text-green">View reservations</button>
                </div>
              </article>
            )
          })
        )}
      </div>

      {createPortal(
        <div className="gift-detail-actionbar" aria-label="Gift list actions">
          <Link to={`/app/lists/${listId}/edit`}><Settings size={20} /> List Settings</Link>
          <button onClick={copyLink} type="button"><Share2 size={20} /> Share</button>
          <Link className="gift-detail-actionbar__primary" to={`/app/lists/${listId}/items/new`}>Add Item</Link>
        </div>,
        document.body
      )}

      <ReservationsModal 
        item={items.find(i => i.id === expandedItemId)}
        reservations={reservations.filter(r => r.item_id === expandedItemId)}
        onClose={() => setExpandedItemId('')} 
      />

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
    </section>
    </>
  )
}

export default GiftListDetail
