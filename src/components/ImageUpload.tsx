import { useState, useRef } from 'react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../firebase'

interface ImageUploadProps {
  onImageUpload: (url: string) => void
  currentImage?: string
  label?: string
  accept?: string
  maxSize?: number // in MB
}

export function ImageUpload({ 
  onImageUpload, 
  currentImage, 
  label = "Upload hình ảnh",
  accept = "image/*",
  maxSize = 5
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file hình ảnh')
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File quá lớn. Kích thước tối đa: ${maxSize}MB`)
      return
    }

    setError(null)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to Firebase
    uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    try {
      setUploading(true)
      setError(null)

      // Create unique filename
      const timestamp = Date.now()
      const filename = `images/${timestamp}_${file.name}`
      const storageRef = ref(storage, filename)

      // Upload file
      const snapshot = await uploadBytes(storageRef, file)
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      // Call parent callback
      onImageUpload(downloadURL)
      
      setError(null)
    } catch (err: any) {
      setError('Lỗi upload: ' + err.message)
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = event.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        handleFileSelect({ target: { files: [file] } } as any)
      }
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const removeImage = () => {
    setPreview(null)
    onImageUpload('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="image-upload">
      <label className="upload-label">{label}</label>
      
      <div 
        className={`upload-area ${preview ? 'has-preview' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
            <div className="preview-overlay">
              <button 
                type="button" 
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage()
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">📷</div>
            <p>Click để chọn hình ảnh hoặc kéo thả vào đây</p>
            <p className="upload-hint">
              Hỗ trợ: JPG, PNG, GIF • Tối đa: {maxSize}MB
            </p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <span>Đang upload...</span>
        </div>
      )}

      {error && (
        <div className="upload-error">
          ❌ {error}
        </div>
      )}

      <style jsx>{`
        .image-upload {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .upload-label {
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }
        
        .upload-area {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 24px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #f9fafb;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .upload-area:hover {
          border-color: #667eea;
          background: #f3f4f6;
        }
        
        .upload-area.has-preview {
          padding: 0;
          border: none;
          background: transparent;
        }
        
        .upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        
        .upload-icon {
          font-size: 3rem;
          color: #9ca3af;
        }
        
        .upload-placeholder p {
          margin: 0;
          color: #6b7280;
        }
        
        .upload-hint {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        .image-preview {
          position: relative;
          width: 100%;
          height: 200px;
          border-radius: 8px;
          overflow: hidden;
        }
        
        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .preview-overlay {
          position: absolute;
          top: 8px;
          right: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .image-preview:hover .preview-overlay {
          opacity: 1;
        }
        
        .remove-btn {
          background: rgba(239, 68, 68, 0.9);
          color: white;
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .remove-btn:hover {
          background: rgba(239, 68, 68, 1);
        }
        
        .upload-progress {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f0f9ff;
          border-radius: 6px;
          border: 1px solid #bae6fd;
        }
        
        .progress-bar {
          flex: 1;
          height: 4px;
          background: #e0f2fe;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: #0ea5e9;
          animation: progress 2s ease-in-out infinite;
        }
        
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        
        .upload-error {
          padding: 12px;
          background: #fef2f2;
          color: #dc2626;
          border-radius: 6px;
          border: 1px solid #fecaca;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  )
}
