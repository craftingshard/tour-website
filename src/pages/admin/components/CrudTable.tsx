import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc, getDocs, query as fsQuery, where } from 'firebase/firestore'
import { db } from '../../../firebase'
import { ImageUpload } from '../../../components/ImageUpload'
import { RichTextEditor } from '../../../components/RichTextEditor'
import { useAdmin } from '../../../context/AdminProviders'

type FieldType = 'string' | 'number' | 'boolean' | 'text' | 'date' | 'array' | 'select' | 'select-multiple' | 'color'

export type CrudColumn = {
  key: string
  label: string
  type: FieldType
  required?: boolean
  tooltip?: string
  options?: Array<{ value: string; label: string }>
  collection?: string
  displayField?: string
  valueField?: string
  createDefaults?: Record<string, unknown>
  hideInForm?: boolean
  hideInTable?: boolean
  render?: (value: any) => React.ReactNode
}

type CrudTableProps = {
  collectionName: string
  columns: CrudColumn[]
  title: string
  createDefaults?: Record<string, unknown>
}

export function CrudTable({ collectionName, columns, title, createDefaults }: CrudTableProps) {
  const [items, setItems] = useState<Array<{ id: string; [k: string]: any }>>([])
  const [queryText, setQueryText] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [featuredFilter, setFeaturedFilter] = useState<boolean | null>(null)
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all')
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all')
  const [tourFilter, setTourFilter] = useState<string>('all')
  const [form, setForm] = useState<Record<string, any>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [showForm, setShowForm] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [referenceData, setReferenceData] = useState<Record<string, any[]>>({})
  const { hasPermission, currentUser } = useAdmin()

  const colRef = useMemo(() => collection(db, collectionName), [collectionName])
  const listSource = useMemo(() => {
    if (collectionName === 'TOURS' && currentUser?.role === 'staff') {
      return fsQuery(collection(db, collectionName), where('createdBy', '==', currentUser.uid))
    }
    return colRef
  }, [collectionName, currentUser, colRef])

  // Calculate pagination
  const filteredItems = useMemo(() => {
    let filtered = items

    // Apply status filter for TOURS collection
    if (collectionName === 'TOURS' && statusFilter !== 'all') {
      if (statusFilter === 'approved') {
        filtered = filtered.filter(item => item.approved === true)
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(item => item.approved === false)
      }
    }

    // Apply featured filter for TOURS and POSTS collections
    if ((collectionName === 'TOURS' || collectionName === 'POSTS') && featuredFilter !== null) {
      filtered = filtered.filter(item => item.featured === featuredFilter)
    }

    // Apply booking-specific filters
    if (collectionName === 'bookings') {
      if (bookingStatusFilter !== 'all') {
        filtered = filtered.filter(item => item.status === bookingStatusFilter)
      }
      if (paymentMethodFilter !== 'all') {
        filtered = filtered.filter(item => item.method === paymentMethodFilter)
      }
      if (tourFilter !== 'all') {
        filtered = filtered.filter(item => item.tourId === tourFilter)
      }
    }

    // Apply text search filter
    if (!queryText.trim()) return filtered
    const q = queryText.trim().toLowerCase()
    return filtered.filter((row) => {
      return columns.some((c) => {
        const v = row[c.key]
        if (v == null) return false
        if (typeof v === 'string') return v.toLowerCase().includes(q)
        if (typeof v === 'number') return String(v).includes(q)
        if (v?.toDate) return v.toDate().toLocaleDateString('vi-VN').toLowerCase().includes(q)
        if (Array.isArray(v)) return v.join(', ').toLowerCase().includes(q)
        return String(v).toLowerCase().includes(q)
      })
    })
  }, [items, columns, queryText, statusFilter, featuredFilter, bookingStatusFilter, paymentMethodFilter, tourFilter, collectionName])

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredItems.slice(startIndex, endIndex)

  // Reset to first page when collection changes
  useEffect(() => { 
    setCurrentPage(1)
    setStatusFilter('all')
    setFeaturedFilter(null)
    setBookingStatusFilter('all')
    setPaymentMethodFilter('all')
    setTourFilter('all')
    resetForm() 
  }, [collectionName])

  // Load reference data for select fields
  useEffect(() => {
    loadReferenceData()
  }, [columns])

  const loadReferenceData = async () => {
    const refData: Record<string, any[]> = {}
    
    for (const col of columns) {
      if (col.type === 'select' && col.collection) {
        try {
          const snapshot = await getDocs(collection(db, col.collection))
          const data = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          }))
          refData[col.key] = data
        } catch (error) {
          console.error(`Error loading reference data for ${col.collection}:`, error)
          refData[col.key] = []
        }
      }
    }
    
    setReferenceData(refData)
  }

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToNextPage = () => goToPage(currentPage + 1)
  const goToPrevPage = () => goToPage(currentPage - 1)

  useEffect(() => {
    const unsub = onSnapshot(listSource as any, (snap: any) => {
      const rows: Array<{ id: string; [k: string]: any }> = []
      snap.forEach((d: any) => rows.push({ id: d.id, ...d.data() }))
      rows.sort((a, b) => {
        const aCreated = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (typeof a.createdAt === 'number' ? a.createdAt : (a.createdAt ? new Date(a.createdAt).getTime() : 0))
        const bCreated = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (typeof b.createdAt === 'number' ? b.createdAt : (b.createdAt ? new Date(b.createdAt).getTime() : 0))
        if (bCreated !== aCreated) return bCreated - aCreated
        const aUpdated = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : (typeof a.updatedAt === 'number' ? a.updatedAt : (a.updatedAt ? new Date(a.updatedAt).getTime() : 0))
        const bUpdated = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : (typeof b.updatedAt === 'number' ? b.updatedAt : (b.updatedAt ? new Date(b.updatedAt).getTime() : 0))
        return bUpdated - aUpdated
      })
      setItems(rows)
      setLoading(false)
    })
    return () => unsub()
  }, [listSource])

  const resetForm = () => {
    const init: Record<string, any> = {}
    columns.forEach((c) => {
      if (c.type === 'boolean') init[c.key] = false
      else if (c.type === 'array') init[c.key] = []
      else if (c.type === 'date') {
        // Set default date to today for bookingDate and travelDate
        if (c.key === 'bookingDate' || c.key === 'travelDate') {
          init[c.key] = new Date().toISOString().split('T')[0]
        } else {
          init[c.key] = ''
        }
      }
      else init[c.key] = ''
    })
    if (createDefaults) Object.assign(init, createDefaults)
    // Posts defaults
    if (collectionName === 'POSTS') {
      init['status'] = 'draft'
      init['publishedAt'] = new Date().toISOString().split('T')[0]
    }
    setForm(init)
    setEditingId(null)
  }

  useEffect(() => { resetForm() }, [collectionName])

  const onChange = (key: string, value: any) => {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const onEdit = (row: any) => {
    setEditingId(row.id)
    const f: Record<string, any> = {}
    columns.forEach((c) => {
      if (c.key === 'createdAt') return // Skip createdAt on edit
      if (c.type === 'boolean') f[c.key] = row[c.key] ?? false
      else if (c.type === 'array') f[c.key] = row[c.key] ?? []
      else if (c.type === 'date') {
        if (row[c.key]?.toDate) {
          f[c.key] = row[c.key].toDate().toISOString().split('T')[0]
        } else if (row[c.key]) {
          f[c.key] = new Date(row[c.key]).toISOString().split('T')[0]
        } else {
          f[c.key] = ''
        }
      }
      else f[c.key] = row[c.key] ?? ''
    })
    setForm(f)
    setShowForm(true)
  }

  const onDelete = async (id: string) => {
    if (!hasPermission('delete', collectionName)) {
      setError('Bạn không có quyền xóa dữ liệu này')
      return
    }
    
    if (!confirm('Xóa bản ghi này?')) return
    try {
      await deleteDoc(doc(db, collectionName, id))
    } catch (err: any) {
      setError('Lỗi xóa: ' + err.message)
    }
  }

  const deleteAllItems = async () => {
    if (!hasPermission('delete', collectionName)) {
      setError('Bạn không có quyền xóa dữ liệu này')
      return
    }
    
    if (currentUser?.role !== 'admin') {
      setError('Chỉ admin mới có quyền xóa tất cả dữ liệu')
      return
    }
    
    try {
      setLoading(true)
      const batch = items.map(item => deleteDoc(doc(db, collectionName, item.id)))
      await Promise.all(batch)
      setItems([])
    } catch (error) {
      console.error('Error deleting all documents:', error)
      setError('Lỗi khi xóa tất cả bản ghi')
    } finally {
      setLoading(false)
    }
  }

  const approveTour = async (tourId: string) => {
    if (!hasPermission('update', collectionName)) {
      setError('Bạn không có quyền duyệt tour')
      return
    }
    try {
      setLoading(true)
      await updateDoc(doc(db, collectionName, tourId), {
        approved: true,
        approvedBy: currentUser?.email,
        approvedAt: new Date()
      })
      // Reload data
      window.location.reload()
    } catch (error) {
      console.error('Error approving tour:', error)
      setError('Lỗi khi duyệt tour')
    } finally {
      setLoading(false)
    }
  }

  const confirmPayment = async (bookingId: string) => {
    if (!hasPermission('update', collectionName)) {
      setError('Bạn không có quyền xác nhận thanh toán')
      return
    }
    try {
      setLoading(true)
      await updateDoc(doc(db, collectionName, bookingId), {
        paid: true,
        status: 'confirmed',
        confirmedAt: new Date(),
        confirmedBy: currentUser?.email
      })
      // Reload data
      window.location.reload()
    } catch (error) {
      console.error('Error confirming payment:', error)
      setError('Lỗi khi xác nhận thanh toán')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Check permissions
    const action = editingId ? 'update' : 'create'
    if (!hasPermission(action, collectionName)) {
      setError(`Bạn không có quyền ${action === 'create' ? 'thêm' : 'cập nhật'} dữ liệu này`)
      return
    }
    
    try {
      const payload: Record<string, any> = {}
      for (const c of columns) {
        // Skip createdAt and updatedAt fields in the form
        if (c.key === 'createdAt' || c.key === 'updatedAt') continue
        
        const raw = form[c.key]
        if (c.required && (raw === '' || raw === undefined || raw === null)) {
          throw new Error(`Vui lòng nhập ${c.label}`)
        }
        
        // Validate number fields
        if (c.type === 'number') {
          if (raw !== '' && isNaN(Number(raw))) {
            throw new Error(`${c.label} phải là số`)
          }
          payload[c.key] = raw === '' ? null : Number(raw)
        }
        // Validate phone number format
        else if (c.key === 'customerPhone' && raw !== '') {
          const phoneRegex = /^[0-9+\-\s()]+$/
          if (!phoneRegex.test(raw)) {
            throw new Error('Số điện thoại chỉ được chứa số và ký tự +, -, (, ), khoảng trắng')
          }
          payload[c.key] = raw
        }
        // Validate amount fields
        else if (c.key === 'amount' && raw !== '') {
          if (isNaN(Number(raw)) || Number(raw) < 0) {
            throw new Error('Số tiền phải là số dương')
          }
          payload[c.key] = Number(raw)
        }
        else if (c.type === 'boolean') payload[c.key] = Boolean(raw)
        else if (c.type === 'date') payload[c.key] = raw ? new Date(raw) : null
        else if (c.type === 'array') payload[c.key] = Array.isArray(raw) ? raw : [raw]
        else if (c.type === 'select' || c.type === 'select-multiple') {
          if (c.type === 'select-multiple') {
            payload[c.key] = Array.isArray(raw) ? raw : [raw]
          } else {
            payload[c.key] = raw
          }
        }
        else payload[c.key] = raw
      }
      if (createDefaults) Object.assign(payload, createDefaults)

      // Auto-set createdAt to current date for new records
      if (!editingId) {
        payload.createdAt = new Date()
      }

      // Auto-approve handling: only admin/manager can set approved
      if (collectionName === 'TOURS') {
        if (!editingId) {
          // Force default hidden fields on create
          payload['approved'] = false
          delete payload['approvedBy']
          delete payload['approvedAt']
          payload['createdBy'] = currentUser?.uid
          payload['createdByName'] = currentUser?.name
        } else {
          // On edit, if user toggles approved from false->true, stamp approver
          const prev = items.find(i => i.id === editingId)
          const prevApproved = Boolean(prev?.approved)
          const nextApproved = Boolean(payload['approved'])
          if (!prevApproved && nextApproved && (currentUser?.role === 'admin' || currentUser?.role === 'manager')) {
            payload['approvedBy'] = currentUser?.uid
            payload['approvedAt'] = new Date()
          }
          if (!(currentUser?.role === 'admin' || currentUser?.role === 'manager')) {
            // Staff cannot change approval fields
            delete payload['approved']
            delete payload['approvedBy']
            delete payload['approvedAt']
          }
        }
      }

      // POSTS: defaults for SEO and status
      if (collectionName === 'POSTS') {
        const title = String(payload['title'] || '').trim()
        const excerpt = String(payload['excerpt'] || '').trim()
        const content = String(payload['content'] || '')
        const plainContent = content.replace(/<img[\s\S]*?>/gi, '').replace(/<[^>]*>/g, '')
        if (!payload['seoTitle'] && title) payload['seoTitle'] = title
        if (!payload['seoDescription']) {
          if (excerpt) payload['seoDescription'] = excerpt
          else payload['seoDescription'] = plainContent.slice(0, 200)
        }
        if (!editingId) {
          payload['status'] = 'draft'
          payload['publishedAt'] = new Date()
        }
      }
      
      // Auto-set timestamps and creator info
      if (editingId) {
        // Update: only set updatedAt and updatedBy
        payload['updatedAt'] = new Date()
        payload['updatedBy'] = currentUser?.uid
      } else {
        // Create: set both timestamps and creator info
        payload['createdAt'] = new Date()
        payload['updatedAt'] = new Date()
        payload['createdBy'] = currentUser?.uid
        payload['createdByName'] = currentUser?.name
      }

      if (editingId) {
        await updateDoc(doc(db, collectionName, editingId), payload)
      } else {
        if (collectionName === 'TOURS') {
          payload['status'] = 'pending'
        }
        await addDoc(colRef, payload)
      }
      resetForm()
      setShowForm(false)
    } catch (err: any) {
      setError(err?.message || 'Lỗi lưu dữ liệu')
    }
  }

  const formatValue = (value: any, type: FieldType, column?: CrudColumn) => {
    if (value === null || value === undefined) return '-'
    // Resolve select values to display text when possible
    if ((type === 'select' || type === 'select-multiple') && column && column.collection) {
      const options = referenceData[column.key] || []
      const displayField = column.displayField || 'name'
      const valueField = column.valueField || 'id'
      if (type === 'select-multiple' && Array.isArray(value)) {
        const labels = value.map((v: any) => {
          const found = options.find((o: any) => String(o[valueField]) === String(v))
          return found ? String(found[displayField] ?? v) : String(v)
        })
        return labels.join(', ')
      } else {
        const found = options.find((o: any) => String(o[valueField]) === String(value))
        if (found) return String(found[displayField] ?? value)
      }
    }
    if (type === 'boolean') return value ? '✅' : '❌'
    if (type === 'date') return value?.toDate ? value.toDate().toLocaleDateString('vi-VN') : new Date(value).toLocaleDateString('vi-VN')
    if (type === 'array') return Array.isArray(value) ? value.join(', ') : value
    if (type === 'number') return value.toLocaleString('vi-VN')
    
    // Handle image URLs
    if (type === 'string' && value.includes('http') && (value.includes('.jpg') || value.includes('.jpeg') || value.includes('.png') || value.includes('.gif') || value.includes('picsum.photos'))) {
      return (
        <img 
          src={value} 
          alt="Image" 
          style={{ 
            width: '60px', 
            height: '60px', 
            objectFit: 'cover', 
            borderRadius: '6px',
            border: '1px solid #e5e7eb'
          }} 
        />
      )
    }
    
    return String(value)
  }

  const renderField = (col: CrudColumn) => {
    const value = form[col.key] ?? ''
    if (col.type === 'color') {
      return (
        <input 
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(col.key, e.target.value)}
        />
      )
    }

    
    if (col.type === 'boolean') {
      return (
        <div className="checkbox-wrapper">
          <input 
            type="checkbox" 
            checked={!!value} 
            onChange={(e) => onChange(col.key, e.target.checked)} 
          />
          <span className="checkmark"></span>
        </div>
      )
    }
    
    if (col.type === 'text') {
      // Use RichTextEditor for long content fields
      if (['description', 'content'].includes(col.key)) {
        return (
          <RichTextEditor 
            value={value || ''} 
            onChange={(html) => onChange(col.key, html)}
          />
        )
      }
      return (
        <textarea 
          rows={4} 
          value={value} 
          onChange={(e) => onChange(col.key, e.target.value)}
          placeholder={`Nhập ${col.label.toLowerCase()}...`}
        />
      )
    }
    
    if (col.type === 'date') {
      return (
        <input 
          type="date" 
          value={value} 
          onChange={(e) => onChange(col.key, e.target.value)}
        />
      )
    }
    
    if (col.type === 'array') {
      return (
        <input 
          type="text" 
          value={Array.isArray(value) ? value.join(', ') : value} 
          onChange={(e) => onChange(col.key, e.target.value.split(',').map(s => s.trim()))}
          placeholder="Nhập các giá trị, phân cách bằng dấu phẩy"
        />
      )
    }
    
    if (col.type === 'select') {
      if (col.collection && referenceData[col.key]) {
        const options = referenceData[col.key]
        const displayField = col.displayField || 'name'
        const valueField = col.valueField || 'id'
        
        return (
          <select 
            value={value} 
            onChange={(e) => onChange(col.key, e.target.value)}
          >
            <option value="">Chọn {col.label.toLowerCase()}</option>
            {options.map((option) => (
              <option key={option.id} value={option[valueField]}>
                {option[displayField]}
              </option>
            ))}
          </select>
        )
      }
      
      if (col.options) {
        return (
          <select 
            value={value} 
            onChange={(e) => onChange(col.key, e.target.value)}
          >
            <option value="">Chọn {col.label.toLowerCase()}</option>
            {col.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      }
    }
    
    if (col.type === 'select-multiple') {
      if (col.collection && referenceData[col.key]) {
        const options = referenceData[col.key]
        const displayField = col.displayField || 'name'
        const valueField = col.valueField || 'id'
        
        return (
          <select 
            multiple
            value={Array.isArray(value) ? value : []} 
            onChange={(e) => {
              const selectedValues = Array.from(e.target.selectedOptions, option => option.value)
              onChange(col.key, selectedValues)
            }}
          >
            {options.map((option) => (
              <option key={option.id} value={option[valueField]}>
                {option[displayField]}
              </option>
            ))}
          </select>
        )
      }
    }
    
    // Images support
    if (col.key === 'imageUrl') {
      return (
        <div style={{display:'grid', gap:8}}>
          <input 
            type="text" 
            value={value}
            onChange={(e)=> onChange(col.key, e.target.value)}
            placeholder="URL ảnh đại diện" 
          />
          <ImageUpload onImageUpload={(url)=> onChange(col.key, url)} currentImage={value} label="Upload ảnh đại diện" accept="image/png, image/jpeg, image/jpg" />
        </div>
      )
    }
    if (col.key === 'qrImageUrl') {
      return (
        <div style={{display:'grid', gap:8}}>
          <input 
            type="text" 
            value={value}
            onChange={(e)=> onChange(col.key, e.target.value)}
            placeholder="URL ảnh QR chuyển khoản" 
          />
          <ImageUpload onImageUpload={(url)=> onChange(col.key, url)} currentImage={value} label="Upload ảnh QR ngân hàng" accept="image/png, image/jpeg, image/jpg" />
        </div>
      )
    }
    if (col.key === 'images') {
      const images: string[] = Array.isArray(value) ? value : []
      return (
        <div style={{display:'grid', gap:8}}>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {images.map((url, idx) => (
              <div key={idx} style={{position:'relative'}}>
                <img src={url} alt="img" style={{width:300, height:200, objectFit:'cover', borderRadius:6, border:'1px solid #e5e7eb'}} />
                <button type="button" className="btn small danger" style={{position:'absolute', top:2, right:2}} onClick={()=>{
                  const next = images.filter((_,i)=> i!==idx)
                  onChange(col.key, next)
                }}>✕</button>
              </div>
            ))}
          </div>
          <ImageUpload onImageUpload={(url)=> onChange(col.key, [...images, url])} label="Thêm ảnh" accept="image/png, image/jpeg, image/jpg" />
        </div>
      )
    }

    // Default input field
    return (
      <input 
        type={col.type === 'number' ? 'number' : 'text'} 
        value={value} 
        onChange={(e) => onChange(col.key, col.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
        placeholder={`Nhập ${col.label.toLowerCase()}...`}
      />
    )
  }

  return (
    <div className="crud-container">
      {/* Header */}
      <div className="crud-header">
        <h2>{title}</h2>
        <div className="header-actions">
          {hasPermission('create', collectionName) && (
            <button 
              type="button" 
              className="btn primary"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? '📋 Xem danh sách' : '➕ Thêm mới'}
            </button>
          )}
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="form-section">
          <form onSubmit={onSubmit} className="crud-form">
            <div className="form-grid">
              {columns.filter(c => !c.hideInForm && c.key !== 'createdAt').map((c) => (
                <div key={c.key} className="form-field">
                  <label>
                    <span className="field-label">
                      {c.label}
                      {c.required && <span className="required">*</span>}
                      {c.tooltip && (
                        <span className="tooltip-icon" title={c.tooltip}>
                          ℹ️
                        </span>
                      )}
                    </span>
                    {renderField(c)}
                  </label>
                </div>
              ))}
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-actions">
              <button className="btn primary" type="submit">
                {editingId ? '💾 Cập nhật' : '➕ Thêm mới'}
              </button>
              {editingId && (
                <button type="button" className="btn secondary" onClick={resetForm}>
                  🔄 Làm mới
                </button>
              )}
              <button type="button" className="btn ghost" onClick={() => setShowForm(false)}>
                ❌ Đóng
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="table-section">
        <div className="table-header">
          <h3>📋 Danh sách ({filteredItems.length} bản ghi)</h3>
          <div className="header-actions">
            <input
              placeholder="Tìm kiếm..."
              value={queryText}
              onChange={(e)=> setQueryText(e.target.value)}
              className="search-input"
            />
            {collectionName === 'TOURS' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="approved">Đã duyệt</option>
                <option value="pending">Chờ duyệt</option>
              </select>
            )}
            {(collectionName === 'TOURS' || collectionName === 'POSTS') && (
              <select
                value={featuredFilter === null ? 'all' : featuredFilter ? 'true' : 'false'}
                onChange={(e) => {
                  const value = e.target.value
                  setFeaturedFilter(value === 'all' ? null : value === 'true')
                }}
                className="status-filter"
              >
                <option value="all">Tất cả {collectionName === 'TOURS' ? 'tour' : 'bài viết'}</option>
                <option value="true">Chỉ {collectionName === 'TOURS' ? 'tour' : 'bài viết'} nổi bật</option>
                <option value="false">Chỉ {collectionName === 'TOURS' ? 'tour' : 'bài viết'} thường</option>
              </select>
            )}
            {collectionName === 'bookings' && (
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="cancelled">Đã hủy</option>
                <option value="completed">Hoàn thành</option>
              </select>
            )}
            {collectionName === 'bookings' && (
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">Tất cả hình thức</option>
                <option value="cash">Tiền mặt</option>
                <option value="bank_transfer">Chuyển khoản</option>
              </select>
            )}
            {collectionName === 'bookings' && referenceData.TOURS && (
              <select
                value={tourFilter}
                onChange={(e) => setTourFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">Tất cả tour</option>
                {referenceData.TOURS.map((tour: any) => (
                  <option key={tour.id} value={tour.id}>{tour.name}</option>
                ))}
              </select>
            )}
            {hasPermission('delete', collectionName) && currentUser?.role === 'admin' && items.length > 0 && (
              <button 
                className="btn danger"
                onClick={() => {
                  if (confirm(`Bạn có chắc chắn muốn xóa TẤT CẢ ${items.length} bản ghi trong ${collectionName}? Hành động này không thể hoàn tác!`)) {
                    deleteAllItems()
                  }
                }}
                style={{whiteSpace: 'nowrap'}}
              >
                🗑️ Xóa tất cả dữ liệu
              </button>
            )}
          </div>
        </div>
        
        <div className="table-container">
          {loading ? (
            <div className="loading">🔄 Đang tải dữ liệu...</div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>Chưa có dữ liệu nào</p>
              <button 
                className="btn primary"
                onClick={() => setShowForm(true)}
              >
                ➕ Thêm mới
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  {columns.filter(c => !c.hideInTable).map(c => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th className="actions-header">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(row => (
                  <tr key={row.id} className="data-row">
                    {columns.filter(c => !c.hideInTable).map(c => {
                      const cellValue = row[c.key];
                      const cellContent = c.render 
                        ? c.render(cellValue) 
                        : formatValue(cellValue, c.type, c);
                      return (
                        <td key={c.key} className="data-cell">
                          {cellContent}
                        </td>
                      );
                    })}
                    <td className="actions-cell">
                      {collectionName === 'TOURS' && !row.approved && hasPermission('update', collectionName) && (
                        <button className="btn small success" onClick={() => approveTour(row.id)}>
                          ✅ Duyệt
                        </button>
                      )}
                      {collectionName === 'bookings' && !row.paid && hasPermission('update', collectionName) && (
                        <button className="btn small success" onClick={() => confirmPayment(row.id)}>
                          💰 Đã nhận tiền
                        </button>
                      )}
                      {hasPermission('update', collectionName) && (
                        <button className="btn small primary" onClick={() => onEdit(row)}>
                          ✏️ Sửa
                        </button>
                      )}
                      {hasPermission('delete', collectionName) && (
                        <button className="btn small danger" onClick={() => onDelete(row.id)}>
                          🗑️ Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button onClick={goToPrevPage} disabled={currentPage === 1}>Trước</button>
            <span>Trang {currentPage} / {totalPages}</span>
            <button onClick={goToNextPage} disabled={currentPage === totalPages}>Sau</button>
          </div>
        )}
      </div>

      <style>{`
        .crud-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          color: #111827;
        }
        
        .crud-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .crud-header h2 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
        }
        
        .form-section {
          padding: 24px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .crud-form {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }
        
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .field-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #374151;
        }
        
        .required {
          color: #ef4444;
          font-weight: 700;
        }
        
        .tooltip-icon {
          cursor: help;
          font-size: 14px;
          opacity: 0.7;
        }
        
        .tooltip-icon:hover {
          opacity: 1;
        }
        
        .form-field input,
        .form-field select,
        .form-field textarea {
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        
        .form-field input:focus,
        .form-field select:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .checkmark {
          font-size: 16px;
        }
        
        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #fecaca;
        }
        
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        
        .table-section {
          padding: 24px;
        }
        
        .table-header {
          margin-bottom: 20px;
        }
        
        .table-header h3 {
          margin: 0;
          color: #374151;
          font-size: 18px;
          font-weight: 600;
        }

        .table-header .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .search-input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          min-width: 220px;
        }
        
        .status-filter {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          min-width: 150px;
          background: white;
        }
        
        .table-container {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .loading {
          padding: 40px;
          text-align: center;
          color: #6b7280;
          font-size: 16px;
        }
        
        .empty-state {
          padding: 40px;
          text-align: center;
          color: #6b7280;
        }
        
        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .data-table {
          width: 100%;
          min-width: 800px;
          border-collapse: collapse;
          font-size: 14px;
        }
        
        .data-table th {
          background: #f9fafb;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          min-width: 120px;
          white-space: nowrap;
        }
        
        .data-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: top;
          min-width: 120px;
          color: #111827;
          
        }
        
        .data-table tr:hover {
          background: #f9fafb;
        }
        
        .actions-header {
          min-width: 150px;
          text-align: center;
        }
        
        .actions-cell {
          min-width: 150px;
          text-align: center;
        }
        
        .actions-cell .btn {
          margin: 0 4px;
        }
        
        .btn.small.success {
          background: #10b981;
          color: white;
          padding: 4px 8px;
          font-size: 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn.small.success:hover {
          background: #059669;
        }
        
        .pagination-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 16px;
          margin-top: 24px;
          padding: 16px;
        }
        
        .pagination-controls button {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          background: #ffffff;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .pagination-controls button:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        
        .pagination-controls button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination-controls span {
          color: #6b7280;
          font-weight: 500;
        }
        
        /* Custom scrollbar for table */
        .table-container {
          overflow-x: auto;
        }
        
        .table-container::-webkit-scrollbar {
          height: 8px;
        }
        
        .table-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .table-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        
        .table-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Column width adjustments */
        .data-table th:nth-child(1),
        .data-table td:nth-child(1) {
          width: 200px;
          min-width: 200px;
        }
        
        .data-table th:nth-child(2),
        .data-table td:nth-child(2) {
          width: 180px;
          min-width: 180px;
        }
        
        .data-table th:nth-child(3),
        .data-table td:nth-child(3) {
          width: 200px;
          min-width: 200px;
        }
        
        .data-table th:nth-child(4),
        .data-table td:nth-child(4) {
          width: 150px;
          min-width: 150px;
        }
        
        .data-table th:nth-child(5),
        .data-table td:nth-child(5) {
          width: 120px;
          min-width: 120px;
        }
        
        .data-table th:nth-child(6),
        .data-table td:nth-child(6) {
          width: 120px;
          min-width: 120px;
        }
        
        .data-table th:nth-child(7),
        .data-table td:nth-child(7) {
          width: 120px;
          min-width: 120px;
        }
        
        .data-table th:nth-child(8),
        .data-table td:nth-child(8) {
          width: 150px;
          min-width: 150px;
        }
        
        .data-table th:nth-child(9),
        .data-table td:nth-child(9) {
          width: 120px;
          min-width: 120px;
        }
        
        .data-table th:nth-child(10),
        .data-table td:nth-child(10) {
          width: 120px;
          min-width: 120px;
        }
        
        .data-table th:nth-child(11),
        .data-table td:nth-child(11) {
          width: 120px;
          min-width: 120px;
        }
          @media (max-width: 600px) 
          {
            .table-header {
                /* Chuyển sang flexbox để căn chỉnh các phần tử bên trong */
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
            }
            .btn.small.success {    margin: 4px 4px;}
            .table-header .header-actions {
                /* Sắp xếp các actions theo chiều dọc */
                flex-direction: column;
                align-items: flex-start;
                width: 100%; /* Đảm bảo các phần tử chiếm toàn bộ chiều ngang */
            }
            
            .table-header .header-actions > * {
                /* Đảm bảo mỗi phần tử con chiếm toàn bộ chiều ngang */
                width: 100%;
            }
            
            .table-header .header-actions .search-field {
                /* Nếu có một ô tìm kiếm cụ thể, đảm bảo nó cũng full width */
                width: 100%;
                box-sizing: border-box;
            }
            .data-table td, .data-table th, .search-input, .status-filter, .table-header h3 {
                  font-size: 12px;
              }
              .crud-header h2 {
                  font-size: 18px;
              }
              .crud-header, .form-section, .table-section {
                  padding: 16px;
              }
              .data-table th, .data-table td {
                  padding: 10px 8px;
                  margin:5px
              }
          }
              /* ========================================= */
              /* Responsive styles for Tablet (601px - 900px) */
              /* ========================================= */
              @media (min-width: 601px) and (max-width: 900px) {
                  /* Điều chỉnh font-size trung bình cho nội dung bảng */
                  .data-table td, .data-table th, .search-input, .status-filter {
                      font-size: 13px;
                  }
                  .btn.small.success {    margin: 4px 4px;}
                  /* Giảm kích thước tiêu đề */
                  .crud-header h2 {
                      font-size: 20px;
                  }
                  
                  /* Giảm padding một chút so với desktop */
                  .crud-header, .form-section, .table-section {
                      padding: 20px;
                  }
              }
      `}
      </style>
    </div>
  )
}


