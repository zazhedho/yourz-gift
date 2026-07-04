import { beforeEach, describe, expect, it, vi } from 'vitest'

import api from './api'
import mediaService from './mediaService'

vi.mock('./api', () => ({
  default: {
    delete: vi.fn(),
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

  it('deletes image by url', () => {
    mediaService.deleteImage('https://cdn.example.com/gift.png')

    expect(api.delete).toHaveBeenCalledWith('/media', {
      data: { url: 'https://cdn.example.com/gift.png' },
    })
  })
})
