import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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
    <MemoryRouter initialEntries={['/app/lists/list-1']}>
      <Routes>
        <Route path="/app/lists/:listId" element={<GiftListDetail />} />
      </Routes>
    </MemoryRouter>,
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
})
