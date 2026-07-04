import { CheckCircle2, ExternalLink, Gift, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCallback, useEffect, useMemo, useState } from 'react'

import Loading from '../../components/common/Loading'
import RetryState from '../../components/common/RetryState'
import giftService from '../../services/giftService'
import { getErrorMessage, getListData } from '../../services/api'

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

const GiftReceived = () => {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('received')
  const [thankFilter, setThankFilter] = useState('to_thank')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const listsResponse = await giftService.listLists()
      const lists = getListData(listsResponse)
      const listDetails = await Promise.all(lists.map(async (list) => {
        const [itemsResponse, reservationsResponse] = await Promise.all([
          giftService.listItems(list.id),
          giftService.listReservations(list.id),
        ])
        return {
          items: getListData(itemsResponse),
          list,
          reservations: getListData(reservationsResponse),
        }
      }))
      const nextRows = listDetails.flatMap(({ list, items, reservations }) => (
        items.map((item) => {
          const itemReservations = reservations.filter((reservation) => reservation.item_id === item.id && reservation.status !== 'canceled')
          const reservedQty = itemReservations.reduce((total, reservation) => total + Number(reservation.quantity || 0), 0)
          const remaining = Number(item.quantity_remaining ?? Math.max(Number(item.quantity || 0) - reservedQty, 0))
          return {
            id: `${list.id}:${item.id}`,
            item,
            list,
            receivedInFull: remaining === 0 || (Number(item.quantity || 0) > 0 && reservedQty >= Number(item.quantity || 0)),
            reservations: itemReservations,
            reservedQty,
            remaining,
          }
        }).filter((row) => row.reservations.length > 0)
      ))
      setRows(nextRows)
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load received gifts'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const visibleRows = useMemo(() => rows
    .filter((row) => (mode === 'received' ? row.receivedInFull : !row.receivedInFull))
    .filter((row) => {
      if (thankFilter === 'all') return true
      const thanked = row.reservations.length > 0 && row.reservations.every((reservation) => Boolean(reservation.thanked_at))
      return thankFilter === 'thanked' ? thanked : !thanked
    }), [mode, rows, thankFilter])

  const markThanked = async (row) => {
    const unthanked = row.reservations.filter((reservation) => !reservation.thanked_at)
    if (unthanked.length === 0) return
    try {
      await Promise.all(unthanked.map((reservation) => giftService.markReservationThanked(reservation.id)))
      await load()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to mark gift thanked'))
    }
  }

  if (loading) return <Loading label="Loading received gifts" />
  if (error) return <RetryState message={error} onRetry={load} />

  return (
    <section className="received-page">
      <header className="received-page__header">
        <h1>Gifts you've received</h1>
        <p>The items which have been reserved on your lists. Why not say thank you?</p>
      </header>

      <div className="received-page__mode" role="tablist" aria-label="Gift status">
        <button className={mode === 'reserved' ? 'is-active' : ''} onClick={() => setMode('reserved')} type="button">Reserved</button>
        <button className={mode === 'received' ? 'is-active' : ''} onClick={() => setMode('received')} type="button">Received</button>
      </div>

      <div className="received-page__filters" role="tablist" aria-label="Thank status">
        <button className={thankFilter === 'all' ? 'is-active' : ''} onClick={() => setThankFilter('all')} type="button">All</button>
        <button className={thankFilter === 'to_thank' ? 'is-active' : ''} onClick={() => setThankFilter('to_thank')} type="button">To Thank</button>
        <button className={thankFilter === 'thanked' ? 'is-active' : ''} onClick={() => setThankFilter('thanked')} type="button">Thanked</button>
      </div>

      {visibleRows.length === 0 ? (
        <div className="gift-detail-empty">
          <Gift size={38} />
          <h2>No gifts here yet</h2>
          <p>Reserved gifts from your lists will appear here.</p>
        </div>
      ) : (
        <div className="received-page__items">
          {visibleRows.map((row) => {
            const host = sourceHost(row.item.product_url)
            return (
              <article className="gift-detail-item" key={row.id}>
                <div className="gift-detail-item__status">
                  <div className="gift-detail-item__status-text">
                    <CheckCircle2 size={16} />
                    <span>You have {row.reservations.length} active reservation{row.reservations.length === 1 ? '' : 's'} &bull; {row.receivedInFull ? 'Item received in full' : `${row.remaining} still pending`}</span>
                  </div>
                </div>
                <div className="gift-detail-item__body">
                  <div className="gift-detail-item__source">{host || 'manual item'}</div>
                  <p className="received-page__from">From <Link to={`/lists/${row.list.id}`}>{row.list.title}</Link></p>
                  <div className="gift-detail-item__main gift-detail-item__main--received">
                    <div className="gift-detail-item__image">
                      {row.item.image_url ? <img alt="" src={row.item.image_url} /> : <Package size={24} />}
                    </div>
                    <div className="gift-detail-item__text">
                      <h2>{row.item.name}</h2>
                      <div className="gift-detail-item__price">
                        {formatPrice(row.item)}
                        {row.receivedInFull ? <span>Item received in full</span> : null}
                      </div>
                      <p>{row.item.description || row.item.name}</p>
                      {row.item.product_url ? (
                        <a className="gift-detail-online" href={row.item.product_url} rel="noreferrer" target="_blank">
                          View online <ExternalLink size={14} />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="gift-detail-item__footer">
                  <div />
                  <button className="text-green" onClick={() => markThanked(row)} type="button">
                    {row.reservations.every((reservation) => Boolean(reservation.thanked_at)) ? 'Thanked' : 'Mark thanked'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default GiftReceived
