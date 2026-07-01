import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import giftService from './giftService'

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('giftService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uses owner gift list endpoints', () => {
    giftService.listLists()
    giftService.createList({ title: 'Birthday' })
    giftService.getList('list-1')
    giftService.updateList('list-1', { title: 'Updated' })
    giftService.deleteList('list-1')

    expect(api.get).toHaveBeenCalledWith('/gift-lists', { params: { page: 1, limit: 50 } })
    expect(api.post).toHaveBeenCalledWith('/gift-lists', { title: 'Birthday' })
    expect(api.get).toHaveBeenCalledWith('/gift-lists/list-1')
    expect(api.put).toHaveBeenCalledWith('/gift-lists/list-1', { title: 'Updated' })
    expect(api.delete).toHaveBeenCalledWith('/gift-lists/list-1')
  })

  it('uses owner gift item endpoints', () => {
    giftService.listItems('list-1')
    giftService.createItem('list-1', { name: 'Book' })
    giftService.updateItem('item-1', { name: 'Lamp' })
    giftService.deleteItem('item-1')
    giftService.listReservations('list-1')

    expect(api.get).toHaveBeenCalledWith('/gift-lists/list-1/items')
    expect(api.post).toHaveBeenCalledWith('/gift-lists/list-1/items', { name: 'Book' })
    expect(api.put).toHaveBeenCalledWith('/gift-items/item-1', { name: 'Lamp' })
    expect(api.delete).toHaveBeenCalledWith('/gift-items/item-1')
    expect(api.get).toHaveBeenCalledWith('/gift-lists/list-1/reservations')
  })

  it('uses public gift endpoints', () => {
    const payload = { guest_email: 'guest@example.com', quantity: 1 }

    giftService.getPublicList('ABC123')
    giftService.listPublicItems('ABC123')
    giftService.reservePublicItem('ABC123', 'item-1', payload)

    expect(api.get).toHaveBeenCalledWith('/public/gift-lists/ABC123')
    expect(api.get).toHaveBeenCalledWith('/public/gift-lists/ABC123/items')
    expect(api.post).toHaveBeenCalledWith('/public/gift-lists/ABC123/items/item-1/reservations', payload)
  })
})
