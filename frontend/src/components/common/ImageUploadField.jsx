import { useState } from 'react'

import mediaService from '../../services/mediaService'
import { getErrorMessage, getResponseData } from '../../services/api'
import FormField from './FormField'

const ImageUploadField = ({ folder, label, onChange, value }) => {
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  const upload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const response = await mediaService.uploadImage(file, folder)
      const data = getResponseData(response) || {}
      onChange(data.url || '')
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to upload image'))
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div className="image-upload-field">
      <FormField error={error} label={label}>
        <input accept="image/*" className="input" disabled={uploading} onChange={upload} type="file" />
      </FormField>
      {uploading ? <p className="meta">Uploading image...</p> : null}
      {value ? (
        <div className="image-upload-preview">
          <img alt="" src={value} />
          <button className="button button--ghost button--compact" onClick={() => onChange('')} type="button">Remove image</button>
        </div>
      ) : null}
    </div>
  )
}

export default ImageUploadField
