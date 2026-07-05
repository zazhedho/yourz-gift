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
    giftService.listFriendLists()
    giftService.createList({ title: 'Birthday' })
    giftService.getList('list-1')
    giftService.updateList('list-1', { title: 'Updated' })
    giftService.deleteList('list-1')

    expect(api.get).toHaveBeenCalledWith('/gift-lists', { params: { page: 1, limit: 50 } })
    expect(api.get).toHaveBeenCalledWith('/gift-lists/friends', { params: { page: 1, limit: 50 } })
    expect(api.post).toHaveBeenCalledWith('/gift-lists', { title: 'Birthday' })
    expect(api.get).toHaveBeenCalledWith('/gift-lists/list-1')
    expect(api.put).toHaveBeenCalledWith('/gift-lists/list-1', { title: 'Updated' })
    expect(api.delete).toHaveBeenCalledWith('/gift-lists/list-1')
  })

  it('passes search params to gift list endpoints', () => {
    giftService.listLists({ search: 'birthday' })
    giftService.listFriendLists({ search: 'wedding' })

    expect(api.get).toHaveBeenCalledWith('/gift-lists', { params: { page: 1, limit: 50, search: 'birthday' } })
    expect(api.get).toHaveBeenCalledWith('/gift-lists/friends', { params: { page: 1, limit: 50, search: 'wedding' } })
  })

  it('uses friend management endpoints', () => {
    giftService.listFriends({ search: 'zaq' })
    giftService.listFriendRequests()
    giftService.requestFriend({ email: 'friend@example.com' })
    giftService.acceptFriend('friend-1')
    giftService.rejectFriend('friend-2')
    giftService.deleteFriend('friend-3')

    expect(api.get).toHaveBeenCalledWith('/friends', { params: { page: 1, limit: 50, search: 'zaq' } })
    expect(api.get).toHaveBeenCalledWith('/friends/requests', { params: { page: 1, limit: 50 } })
    expect(api.post).toHaveBeenCalledWith('/friends/request', { email: 'friend@example.com' })
    expect(api.post).toHaveBeenCalledWith('/friends/friend-1/accept')
    expect(api.post).toHaveBeenCalledWith('/friends/friend-2/reject')
    expect(api.delete).toHaveBeenCalledWith('/friends/friend-3')
  })

  it('uses owner gift item endpoints', () => {
    giftService.listItems('list-1')
    giftService.listItems('list-1', { archived: true })
    giftService.createItem('list-1', { name: 'Book' })
    giftService.reorderItems('list-1', { items: [{ id: 'item-1', priority: 0 }] })
    giftService.updateItem('item-1', { name: 'Lamp' })
    giftService.deleteItem('item-1')
    giftService.listReservations('list-1')
    giftService.markReservationThanked('reservation-1')
    giftService.cancelReservation('reservation-1', { cancel_reason: 'Guest changed plan' })

    expect(api.get).toHaveBeenCalledWith('/gift-lists/list-1/items', undefined)
    expect(api.get).toHaveBeenCalledWith('/gift-lists/list-1/items', { params: { archived: true } })
    expect(api.post).toHaveBeenCalledWith('/gift-lists/list-1/items', { name: 'Book' })
    expect(api.post).toHaveBeenCalledWith('/gift-lists/list-1/items/reorder', { items: [{ id: 'item-1', priority: 0 }] })
    expect(api.put).toHaveBeenCalledWith('/gift-items/item-1', { name: 'Lamp' })
    expect(api.delete).toHaveBeenCalledWith('/gift-items/item-1')
    expect(api.get).toHaveBeenCalledWith('/gift-lists/list-1/reservations')
    expect(api.post).toHaveBeenCalledWith('/gift-reservations/reservation-1/thank')
    expect(api.post).toHaveBeenCalledWith('/gift-reservations/reservation-1/cancel', { cancel_reason: 'Guest changed plan' })
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
