import { render, screen } from '@testing-library/react'
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
    giftService.listPublicItems.mockResolvedValue({ data: { data: [] } })
  })

  it('shows the owner name beside the occasion', async () => {
    renderPublicList()

    expect(await screen.findByText(/by Zaqia & Zaidus/)).toBeInTheDocument()
  })
})
