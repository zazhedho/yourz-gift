import { ExternalLink } from 'lucide-react'
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
    <main className="public-page">
      <section className="public-hero">
        <div className="public-hero__copy">
          <p className="meta">{formatOccasion(list.occasion_type)}</p>
          <h1 className="public-title">{list.title}</h1>
          <p className="public-description">{list.description || 'Choose a gift and reserve it for the owner.'}</p>
          {list.shipping_note ? <p className="public-description">{list.shipping_note}</p> : null}
        </div>
        <div className="public-cover">
          {list.cover_image_url ? (
            <img alt="" src={list.cover_image_url} />
          ) : (
            <div className="gift-image gift-image--empty">Yourz Gift</div>
          )}
        </div>
      </section>

      {notice ? <div className="alert alert--success">{notice}</div> : null}

      {items.length === 0 ? (
        <EmptyState message="The owner has not added public gift items yet." title="No gifts yet" />
      ) : (
        <section className="public-items">
          {items.map((item) => {
            const remaining = item.quantity_remaining ?? item.quantity
            const canReserve = item.can_reserve !== false && remaining > 0
            return (
              <article className="public-gift-card" key={item.id}>
                <div className={`gift-image ${item.image_url ? '' : 'gift-image--empty'}`}>
                  {item.image_url ? <img alt="" src={item.image_url} /> : <span>{item.name}</span>}
                </div>
                <div className="public-gift-card__body">
                  <h2 className="card__title">{item.name}</h2>
                  <p className="muted">{item.description || 'No description'}</p>
                  <p>{formatPrice(item)}</p>
                  <p className="meta">{remaining} remaining</p>
                  <div className="actions">
                    <Button disabled={!canReserve} variant="light" onClick={() => setSelectedItem(item)}>
                      {canReserve ? 'Reserve' : 'Reserved'}
                    </Button>
                    {item.product_url ? (
                      <a className="button button--ghost" href={item.product_url} target="_blank" rel="noreferrer">
                        <ExternalLink size={16} /> View
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {selectedItem ? (
        <ReservationForm
          code={code}
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onReserved={reserved}
        />
      ) : null}
    </main>
  )
}

export default PublicGiftList
