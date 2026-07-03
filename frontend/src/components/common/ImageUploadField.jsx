import { ImagePlus, Loader2, X } from 'lucide-react'
import { useRef, useState } from 'react'

import mediaService from '../../services/mediaService'
import { getErrorMessage, getResponseData } from '../../services/api'
import FormField from './FormField'

const ImageUploadField = ({ folder, label, onChange, value }) => {
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async (file) => {
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
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const upload = (event) => handleFile(event.target.files?.[0])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="image-upload-field">
      <FormField error={error} label={label}>
        {!value ? (
          <div 
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? '#f43f5e' : 'rgba(0,0,0,0.15)'}`,
              borderRadius: '16px',
              padding: '32px 20px',
              textAlign: 'center',
              background: dragActive ? 'rgba(244,63,94,0.02)' : 'rgba(255,255,255,0.5)',
              cursor: uploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <input ref={inputRef} accept="image/*" disabled={uploading} onChange={upload} type="file" style={{ display: 'none' }} />
            {uploading ? (
              <>
                <Loader2 size={32} className="spinner" color="#f43f5e" />
                <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Uploading your image...</span>
              </>
            ) : (
              <>
                <div style={{ background: '#ffffff', padding: '12px', borderRadius: '50%', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', color: '#f43f5e' }}>
                  <ImagePlus size={24} />
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, color: '#111827', fontSize: '15px' }}>Click to upload or drag and drop</p>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>SVG, PNG, JPG or GIF (max. 5MB)</p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', background: '#f8fafc' }}>
            <img alt="Uploaded preview" src={value} style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block' }} />
            <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation()
                  onChange('')
                }}
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  color: '#ef4444',
                  transition: 'all 0.2s'
                }}
                title="Remove image"
                onMouseEnter={(e) => e.currentTarget.style.background = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </FormField>
    </div>
  )
}

export default ImageUploadField
