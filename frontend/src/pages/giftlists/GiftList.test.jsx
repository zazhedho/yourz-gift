import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import giftService from '../../services/giftService'
import GiftList from './GiftList'

vi.mock('../../services/giftService', () => ({
  default: {
    deleteList: vi.fn(),
    listFriendLists: vi.fn(),
    listLists: vi.fn(),
  },
}))

describe('GiftList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    giftService.listLists.mockResolvedValue({
      data: {
        data: [
          {
            id: 'list-1',
            is_active: true,
            never_expires: true,
            share_code: 'ABC123',
            title: 'A very long birthday gift list title that should remain usable on mobile',
          },
        ],
      },
    })
  })

  it('renders mobile-friendly card actions with an accessible group label', async () => {
    render(<GiftList />, { wrapper: MemoryRouter })

    await waitFor(() => expect(giftService.listLists).toHaveBeenCalled())

    expect(screen.getByRole('group', { name: /actions for a very long birthday gift list title/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view wish list/i })).toBeInTheDocument()
  })
})
