import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import giftService from '../../services/giftService'
import PublicGiftList from './PublicGiftList'

vi.mock('../../services/giftService', () => ({
  default: {
    getPublicList: vi.fn(),
    listPublicItems: vi.fn(),
  },
}))

const renderPublicList = () => render(
  <MemoryRouter initialEntries={['/public/QFEEK2']}>
    <Routes>
      <Route path="/public/:code" element={<PublicGiftList />} />
    </Routes>
  </MemoryRouter>,
)

describe('PublicGiftList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    giftService.getPublicList.mockResolvedValue({
      data: {
        data: {
          title: "ZZ's Wedding",
          occasion_type: 'wedding',
          owner_name: 'Zaqia & Zaidus',
        },
      },
    })
    giftService.listPublicItems.mockResolvedValue({
      data: {
        data: [
          { id: 'older', name: 'Older gift', quantity: 1, quantity_remaining: 1, priority: 0, created_at: '2026-08-01T10:00:00Z' },
          { id: 'newer', name: 'Newer gift', quantity: 1, quantity_remaining: 1, priority: 0, created_at: '2026-08-14T10:00:00Z' },
        ],
      },
    })
  })

  it('shows the owner name beside the occasion', async () => {
    renderPublicList()

    expect(await screen.findByText(/by Zaqia & Zaidus/)).toBeInTheDocument()
  })

  it('sorts items by newest without refetching', async () => {
    const user = userEvent.setup()
    renderPublicList()

    const sort = await screen.findByLabelText('Sort by')
    expect([...document.querySelectorAll('.gift-detail-item h2')].map((node) => node.textContent)).toEqual([
      'Older gift',
      'Newer gift',
    ])

    await user.selectOptions(sort, 'newest')

    expect([...document.querySelectorAll('.gift-detail-item h2')].map((node) => node.textContent)).toEqual([
      'Newer gift',
      'Older gift',
    ])
    expect(giftService.listPublicItems).toHaveBeenCalledTimes(1)
  })

  it('sorts items by name without refetching', async () => {
    const user = userEvent.setup()
    renderPublicList()

    const sort = await screen.findByLabelText('Sort by')
    await user.selectOptions(sort, 'name')

    expect([...document.querySelectorAll('.gift-detail-item h2')].map((node) => node.textContent)).toEqual([
      'Newer gift',
      'Older gift',
    ])
    expect(giftService.listPublicItems).toHaveBeenCalledTimes(1)
  })

  it('flattens the description preview but preserves line breaks in Read more', async () => {
    const description = 'First line\n\nSecond line\nThird line'
    giftService.getPublicList.mockResolvedValueOnce({
      data: {
        data: { title: "ZZ's Wedding", description, occasion_type: 'wedding' },
      },
    })
    renderPublicList()

    await screen.findByText("ZZ's Wedding")
    expect(document.querySelector('.gift-detail-hero__copy > p').textContent).toBe('First line Second line Third line')

    await userEvent.click(screen.getByRole('button', { name: 'Read more' }))
    expect(screen.getByRole('dialog', { name: 'Gift list description' }).querySelector('p').textContent).toBe(description)
  })
})
