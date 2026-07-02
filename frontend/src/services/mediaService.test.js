import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import mediaService from './mediaService'

vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('mediaService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploads image as multipart form data', () => {
    const file = new File(['image'], 'gift.png', { type: 'image/png' })

    mediaService.uploadImage(file, 'gift-items')

    expect(api.post).toHaveBeenCalledWith(
      '/media/upload',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  })
})
