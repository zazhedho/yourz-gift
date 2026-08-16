import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import ReservationsModal from './ReservationsModal'

describe('ReservationsModal', () => {
  it('keeps the empty state separate from reservation cards', () => {
    render(
      <ReservationsModal
        item={{ id: 'item-1', name: 'Baby stroller' }}
        onClose={vi.fn()}
        reservations={[]}
      />,
    )

    expect(screen.getByText('No reservations for this item yet.').parentElement).toHaveClass('reservations-empty-state')
  })

  it('shows the guest note for each reservation', () => {
    render(
      <ReservationsModal
        item={{ id: 'item-1', name: 'Baby stroller' }}
        onClose={vi.fn()}
        reservations={[{
          created_at: '2026-08-16T10:00:00Z',
          guest_name: 'Guest',
          id: 'reservation-1',
          item_id: 'item-1',
          note: 'Please include a handwritten card.',
          quantity: 1,
          status: 'confirmed',
        }]}
      />,
    )

    expect(screen.getByText('Please include a handwritten card.')).toBeInTheDocument()
  })
})
