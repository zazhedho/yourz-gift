import api from './api'

const giftService = {
  listLists: () => api.get('/gift-lists', { params: { page: 1, limit: 50 } }),
  createList: (payload) => api.post('/gift-lists', payload),
  getList: (id) => api.get(`/gift-lists/${id}`),
  updateList: (id, payload) => api.put(`/gift-lists/${id}`, payload),
  deleteList: (id) => api.delete(`/gift-lists/${id}`),
  listItems: (listId) => api.get(`/gift-lists/${listId}/items`),
  createItem: (listId, payload) => api.post(`/gift-lists/${listId}/items`, payload),
  updateItem: (itemId, payload) => api.put(`/gift-items/${itemId}`, payload),
  deleteItem: (itemId) => api.delete(`/gift-items/${itemId}`),
  listReservations: (listId) => api.get(`/gift-lists/${listId}/reservations`),
  getPublicList: (code) => api.get(`/public/gift-lists/${code}`),
  listPublicItems: (code) => api.get(`/public/gift-lists/${code}/items`),
  reservePublicItem: (code, itemId, payload) => (
    api.post(`/public/gift-lists/${code}/items/${itemId}/reservations`, payload)
  ),
}

export default giftService
