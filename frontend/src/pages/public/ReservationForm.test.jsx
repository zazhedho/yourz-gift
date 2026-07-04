import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import giftService from '../../services/giftService'
import ReservationForm from './ReservationForm'

vi.mock('../../services/giftService', () => ({
  default: {
    reservePublicItem: vi.fn(),
  },
}))

const item = {
  id: 'item-1',
  name: 'Coffee maker',
  quantity: 3,
  quantity_remaining: 3,
}

describe('ReservationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('clamps typed zero quantity to one', async () => {
    render(<ReservationForm code="ABC123" item={item} onClose={vi.fn()} onReserved={vi.fn()} />)

    const quantity = screen.getByLabelText('Quantity')
    await userEvent.clear(quantity)
    await userEvent.type(quantity, '0')

    expect(quantity).toHaveValue(1)
  })

  it('submits at least one quantity', async () => {
    giftService.reservePublicItem.mockResolvedValue({})
    const onReserved = vi.fn()
    render(<ReservationForm code="ABC123" item={item} onClose={vi.fn()} onReserved={onReserved} />)

    await userEvent.type(screen.getByLabelText('Email'), 'guest@example.com')
    await userEvent.clear(screen.getByLabelText('Quantity'))
    await userEvent.type(screen.getByLabelText('Quantity'), '0')
    await userEvent.click(screen.getByRole('button', { name: /confirm/i }))

    expect(giftService.reservePublicItem).toHaveBeenCalledWith('ABC123', 'item-1', expect.objectContaining({ quantity: 1 }))
  })
})
