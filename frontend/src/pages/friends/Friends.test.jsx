import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import giftService from '../../services/giftService'
import Friends from './Friends'

vi.mock('../../services/giftService', () => ({
  default: {
    acceptFriend: vi.fn(),
    deleteFriend: vi.fn(),
    listFriendRequests: vi.fn(),
    listFriends: vi.fn(),
    rejectFriend: vi.fn(),
    requestFriend: vi.fn(),
  },
}))

const mockFriends = () => {
  giftService.listFriends.mockResolvedValue({
    data: { data: [{ id: 'friend-1', name: 'Jane Friend', email: 'jane@example.com', status: 'accepted' }] },
  })
  giftService.listFriendRequests.mockResolvedValue({
    data: { data: [{ id: 'request-1', name: 'Pending Friend', email: 'pending@example.com', status: 'pending' }] },
  })
}

describe('Friends', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFriends()
  })

  it('renders friends and pending requests', async () => {
    render(<Friends />)

    expect(await screen.findByText('Jane Friend')).toBeInTheDocument()
    expect(screen.getByText('Pending Friend')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /accept pending friend/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /remove jane friend/i })).toBeInTheDocument()
  })

  it('sends friend request by email', async () => {
    giftService.requestFriend.mockResolvedValue({ data: { data: {} } })
    render(<Friends />)

    await screen.findByText('Jane Friend')
    await userEvent.type(screen.getByLabelText(/friend email/i), 'new@example.com')
    await userEvent.click(screen.getByRole('button', { name: /send request/i }))

    expect(giftService.requestFriend).toHaveBeenCalledWith({ email: 'new@example.com' })
    await waitFor(() => expect(screen.getByText('Friend request sent')).toBeInTheDocument())
  })
})
