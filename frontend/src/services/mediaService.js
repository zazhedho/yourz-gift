import api from './api'

const mediaService = {
  uploadImage: (file, folder = 'gift') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)
    return api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteImage: (url) => api.delete('/media', { data: { url } }),
}

export default mediaService
