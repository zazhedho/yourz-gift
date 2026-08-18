import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import giftService from '../../services/giftService'
import GiftReceived from './GiftReceived'

vi.mock('../../services/giftService', () => ({
  default: {
    listItems: vi.fn(),
    listLists: vi.fn(),
    listReservations: vi.fn(),
    markReservationThanked: vi.fn(),
  },
}))

describe('GiftReceived', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    giftService.listLists.mockResolvedValue({ data: { data: [{ id: 'list-1', title: 'Baby Registry' }] } })
    giftService.listItems.mockResolvedValue({
      data: {
        data: [
          { id: 'item-1', name: 'Stroller', quantity: 2, quantity_remaining: 0 },
          { id: 'item-2', name: 'Baby monitor', quantity: 3, quantity_remaining: 2 },
        ],
      },
    })
    giftService.listReservations.mockResolvedValue({
      data: {
        data: [
          { id: 'reservation-1', item_id: 'item-1', guest_name: 'Alya', quantity: 1, show_name: true, status: 'confirmed' },
          { id: 'reservation-2', item_id: 'item-1', guest_email: 'secret@example.com', guest_name: 'Secret Name', quantity: 1, show_name: false, status: 'confirmed' },
          { id: 'reservation-3', item_id: 'item-2', guest_name: 'Bima', quantity: 1, show_name: true, status: 'confirmed' },
        ],
      },
    })
  })

  it('shows reservation details and respects hidden guest names', async () => {
    render(<GiftReceived />, { wrapper: MemoryRouter })

    expect(await screen.findByText('Reserved by')).toBeInTheDocument()
    expect(screen.getByText('Alya')).toBeInTheDocument()
    expect(screen.getByText('Anonymous guest')).toBeInTheDocument()
    expect(screen.queryByText('Secret Name')).not.toBeInTheDocument()
    expect(screen.getByText(/secret@example\.com/)).toBeInTheDocument()
  })

  it('uses distinct status styles for received and reserved cards', async () => {
    const user = userEvent.setup()
    render(<GiftReceived />, { wrapper: MemoryRouter })

    expect(await screen.findByText('Fully reserved')).toBeInTheDocument()
    expect(screen.getByRole('article')).toHaveClass('received-page__card', 'is-received')

    await user.click(screen.getByRole('button', { name: 'Reserved' }))

    expect(screen.getByText('Reservation in progress')).toBeInTheDocument()
    expect(screen.getByRole('article')).toHaveClass('received-page__card', 'is-reserved')
  })
})
