import { Copy, Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCallback, useEffect, useState } from 'react'

import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import ErrorBanner from '../../components/common/ErrorBanner'
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
    <section>
      <div className="page-header">
        <div>
          <h1 className="page-title">{list.title}</h1>
          <p className="page-subtitle">{list.description || 'No description'}</p>
          <p className="meta">Share code: <strong>{list.share_code}</strong></p>
        </div>
        <div className="actions">
          <Button variant="ghost" onClick={copyLink}><Copy size={16} /> Copy link</Button>
          <Link className="button button--ghost" to={`/app/lists/${listId}/edit`}>Edit list</Link>
          <Link className="button button--primary" to={`/app/lists/${listId}/items/new`}><Plus size={16} /> Add item</Link>
        </div>
      </div>
      <ErrorBanner message={notice} />

      <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.8fr)' }}>
        <section className="surface">
          <h2>Items</h2>
          {items.length === 0 ? (
            <EmptyState
              action={<Link className="button button--primary" to={`/app/lists/${listId}/items/new`}>Add first item</Link>}
              message="Guests need visible items before they can reserve."
              title="No items yet"
            />
          ) : (
            <div className="grid">
              {items.map((item) => (
                <article className="card" key={item.id}>
                  <div>
                    <h3 className="card__title">{item.name}</h3>
                    <p className="meta">{item.currency || 'IDR'} {item.price ?? '-'} - qty {item.quantity}</p>
                  </div>
                  <p className="muted">{item.description || 'No description'}</p>
                  <div className="actions">
                    <button className="button button--ghost button--compact" onClick={() => editItem(item)} type="button">Edit</button>
                    <button className="button button--danger button--compact" onClick={() => deleteItem(item.id)} type="button">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="surface">
          <h2>Reservations</h2>
          {reservations.length === 0 ? (
            <p className="muted">No reservations yet.</p>
          ) : (
            <table className="reservation-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>
                      <strong>{reservation.guest_name || reservation.guest_email}</strong>
                      <div className="meta">{reservation.item_name || reservation.item_id}</div>
                    </td>
                    <td>{reservation.quantity}</td>
                    <td>{reservation.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </section>
  )
}

export default GiftListDetail
