import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthContext } from '../../contexts/auth-context'
import giftService from '../../services/giftService'
import GiftListDetail from './GiftListDetail'

vi.mock('../../services/giftService', () => ({
  default: {
    deleteItem: vi.fn(),
    getList: vi.fn(),
    listItems: vi.fn(),
    listReservations: vi.fn(),
  },
}))

const renderDetail = () =>
  render(
    <AuthContext.Provider value={{ user: { name: 'Owner' } }}>
      <MemoryRouter initialEntries={['/lists/list-1']}>
        <Routes>
          <Route path="/lists/:listId" element={<GiftListDetail />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )

describe('GiftListDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    giftService.getList.mockResolvedValue({
      data: {
        data: {
          id: 'list-1',
          title: "ZZ's Wedding",
          description: 'Gift list for family and friends',
          occasion_type: 'wedding',
          share_code: 'QFEEK2',
          cover_image_url: 'https://example.com/cover.jpg',
          is_active: true,
          shipping_note: 'Ask owner for shipping address',
        },
      },
    })
    giftService.listItems.mockResolvedValue({
      data: {
        data: [
          {
            id: 'item-1',
            name: 'Kompor Gas Rinnai 2 Tungku',
            description: 'Rinnai RI 712 TG',
            product_url: 'https://shopee.co.id/product/1',
            image_url: 'https://example.com/item.jpg',
            price: 833700,
            currency: 'IDR',
            quantity: 1,
            quantity_remaining: 0,
            is_active: true,
            priority: 0,
            created_at: '2026-08-01T10:00:00Z',
          },
        ],
      },
    })
    giftService.listReservations.mockResolvedValue({
      data: {
        data: [
          {
            id: 'reservation-1',
            item_id: 'item-1',
            guest_name: 'Guest',
            quantity: 1,
            status: 'confirmed',
          },
        ],
      },
    })
  })

  it('renders Giftwhale-like detail controls and item cards', async () => {
    renderDetail()

    expect(await screen.findByText("ZZ's Wedding")).toBeInTheDocument()
    expect(screen.getByText('AVAILABLE ITEMS')).toBeInTheDocument()
    expect(screen.getByText('ITEMS RESERVED')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /search/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /list settings/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /add item/i })).toBeInTheDocument()
    expect(screen.getByText(/You have 1 active reservation/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view online/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view reservations/i })).toBeInTheDocument()
  })

  it('sorts items by newest without refetching', async () => {
    const user = userEvent.setup()
    giftService.listItems.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'item-1',
            name: 'Kompor Gas Rinnai 2 Tungku',
            description: 'Rinnai RI 712 TG',
            product_url: 'https://shopee.co.id/product/1',
            price: 833700,
            currency: 'IDR',
            quantity: 1,
            quantity_remaining: 0,
            is_active: true,
            priority: 0,
            created_at: '2026-08-01T10:00:00Z',
          },
          {
            id: 'item-2',
            name: 'New Gift',
            description: 'New gift item',
            price: 100,
            currency: 'IDR',
            quantity: 1,
            quantity_remaining: 1,
            is_active: true,
            priority: 1,
            created_at: '2026-08-14T10:00:00Z',
          },
        ],
      },
    })
    renderDetail()

    const sort = await screen.findByLabelText('Sort by')
    await user.selectOptions(sort, 'newest')

    expect([...document.querySelectorAll('.gift-detail-item--owner h2')].map((node) => node.textContent.trim())).toEqual([
      'New Gift',
      'Kompor Gas Rinnai 2 Tungku',
    ])
    expect(giftService.listItems).toHaveBeenCalledTimes(1)
  })

  it('flattens the description preview but preserves line breaks in Read more', async () => {
    const description = 'First line\n\nSecond line\nThird line'
    giftService.getList.mockResolvedValueOnce({
      data: {
        data: { title: "ZZ's Wedding", description },
      },
    })
    renderDetail()

    await screen.findByText("ZZ's Wedding")
    expect(document.querySelector('.gift-detail-hero__copy > p').textContent).toBe('First line Second line Third line')

    await userEvent.click(screen.getByRole('button', { name: 'Read more' }))
    expect(screen.getByRole('dialog', { name: 'Gift list description' }).querySelector('p').textContent).toBe(description)
  })
})
