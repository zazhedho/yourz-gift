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

  it('hides the guest identity when the guest opts out', () => {
    render(
      <ReservationsModal
        item={{ id: 'item-1', name: 'Baby stroller' }}
        onClose={vi.fn()}
        reservations={[{
          guest_email: 'secret@example.com',
          guest_name: 'Secret Name',
          id: 'reservation-1',
          quantity: 1,
          show_name: false,
          status: 'confirmed',
        }]}
      />,
    )

    expect(screen.getByText('Anonymous guest')).toBeInTheDocument()
    expect(screen.queryByText('Secret Name')).not.toBeInTheDocument()
    expect(screen.getByText('secret@example.com')).toBeInTheDocument()
  })
})
