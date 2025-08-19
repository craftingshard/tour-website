import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../../firebase'

type FieldType = 'string' | 'number' | 'boolean' | 'text' | 'date' | 'array'

export type CrudColumn = {
  key: string
  label: string
  type: FieldType
  required?: boolean
}

type CrudTableProps = {
  collectionName: string
  columns: CrudColumn[]
  title: string
  createDefaults?: Record<string, unknown>
}

export function CrudTable({ collectionName, columns, title, createDefaults }: CrudTableProps) {
  const [items, setItems] = useState<Array<{ id: string; [k: string]: any }>>([])
  const [form, setForm] = useState<Record<string, any>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [showForm, setShowForm] = useState<boolean>(false)

  const colRef = useMemo(() => collection(db, collectionName), [collectionName])

  useEffect(() => {
    const unsub = onSnapshot(colRef, (snap) => {
      const rows: Array<{ id: string; [k: string]: any }> = []
      snap.forEach((d) => rows.push({ id: d.id, ...d.data() }))
      setItems(rows)
      setLoading(false)
    })
    return () => unsub()
  }, [colRef])

  const resetForm = () => {
    const init: Record<string, any> = {}
    columns.forEach((c) => {
      if (c.type === 'boolean') init[c.key] = false
      else if (c.type === 'array') init[c.key] = []
      else init[c.key] = ''
    })
    if (createDefaults) Object.assign(init, createDefaults)
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
    columns.forEach((c) => (f[c.key] = row[c.key] ?? (c.type === 'boolean' ? false : c.type === 'array' ? [] : '')))
    setForm(f)
    setShowForm(true)
  }

  const onDelete = async (id: string) => {
    if (!confirm('Xóa bản ghi này?')) return
    try {
      await deleteDoc(doc(db, collectionName, id))
    } catch (err: any) {
      setError('Lỗi xóa: ' + err.message)
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const payload: Record<string, any> = {}
      for (const c of columns) {
        const raw = form[c.key]
        if (c.required && (raw === '' || raw === undefined || raw === null)) {
          throw new Error(`Vui lòng nhập ${c.label}`)
        }
        if (c.type === 'number') payload[c.key] = raw === '' ? null : Number(raw)
        else if (c.type === 'boolean') payload[c.key] = Boolean(raw)
        else if (c.type === 'date') payload[c.key] = raw ? new Date(raw) : null
        else if (c.type === 'array') payload[c.key] = Array.isArray(raw) ? raw : [raw]
        else payload[c.key] = raw
      }
      if (createDefaults) Object.assign(payload, createDefaults)
      if ('createdAt' in form && !form['createdAt']) payload['createdAt'] = new Date()
      if ('updatedAt' in form) payload['updatedAt'] = new Date()

      if (editingId) {
        await updateDoc(doc(db, collectionName, editingId), payload)
      } else {
        await addDoc(colRef, payload)
      }
      resetForm()
      setShowForm(false)
    } catch (err: any) {
      setError(err?.message || 'Lỗi lưu dữ liệu')
    }
  }

  const formatValue = (value: any, type: FieldType) => {
    if (value === null || value === undefined) return '-'
    if (type === 'boolean') return value ? '✅' : '❌'
    if (type === 'date') return value?.toDate ? value.toDate().toLocaleDateString('vi-VN') : new Date(value).toLocaleDateString('vi-VN')
    if (type === 'array') return Array.isArray(value) ? value.join(', ') : value
    if (type === 'number') return value.toLocaleString('vi-VN')
    return String(value)
  }

  return (
    <div className="crud-container">
      {/* Header */}
      <div className="crud-header">
        <h2>{title}</h2>
        <div className="header-actions">
          <button 
            type="button" 
            className="btn primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '📋 Xem danh sách' : '➕ Thêm mới'}
          </button>
        </div>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="form-section">
          <div className="form-header">
            <h3>{editingId ? '✏️ Chỉnh sửa' : '➕ Thêm mới'}</h3>
            <button 
              type="button" 
              className="close-btn"
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={onSubmit} className="crud-form">
            <div className="form-grid">
              {columns.map((c) => (
                <div key={c.key} className="form-field">
                  <label>
                    <span className="field-label">
                      {c.label}
                      {c.required && <span className="required">*</span>}
                    </span>
                    
                    {c.type === 'boolean' ? (
                      <div className="checkbox-wrapper">
                        <input 
                          type="checkbox" 
                          checked={!!form[c.key]} 
                          onChange={(e) => onChange(c.key, e.target.checked)} 
                        />
                        <span className="checkmark"></span>
                      </div>
                    ) : c.type === 'text' ? (
                      <textarea 
                        rows={4} 
                        value={form[c.key] ?? ''} 
                        onChange={(e) => onChange(c.key, e.target.value)}
                        placeholder={`Nhập ${c.label.toLowerCase()}...`}
                      />
                    ) : c.type === 'date' ? (
                      <input 
                        type="date" 
                        value={form[c.key] ?? ''} 
                        onChange={(e) => onChange(c.key, e.target.value)}
                      />
                    ) : c.type === 'array' ? (
                      <input 
                        type="text" 
                        value={Array.isArray(form[c.key]) ? form[c.key].join(', ') : form[c.key] ?? ''} 
                        onChange={(e) => onChange(c.key, e.target.value.split(',').map(s => s.trim()))}
                        placeholder="Nhập các giá trị, phân cách bằng dấu phẩy"
                      />
                    ) : (
                      <input 
                        type={c.type === 'number' ? 'number' : 'text'} 
                        value={form[c.key] ?? ''} 
                        onChange={(e) => onChange(c.key, c.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                        placeholder={`Nhập ${c.label.toLowerCase()}...`}
                      />
                    )}
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
          <h3>📋 Danh sách ({items.length} bản ghi)</h3>
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
                  {columns.map(c => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                  <th className="actions-header">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map(row => (
                  <tr key={row.id} className="data-row">
                    {columns.map(c => (
                      <td key={c.key} className="data-cell">
                        {formatValue(row[c.key], c.type)}
                      </td>
                    ))}
                    <td className="actions-cell">
                      <button className="btn small primary" onClick={() => onEdit(row)}>
                        ✏️ Sửa
                      </button>
                      <button className="btn small danger" onClick={() => onDelete(row.id)}>
                        🗑️ Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style jsx>{`
        .crud-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
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
          font-size: 1.5rem;
          font-weight: 600;
        }
        
        .header-actions {
          display: flex;
          gap: 12px;
        }
        
        .form-section {
          padding: 24px;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }
        
        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .form-header h3 {
          margin: 0;
          color: #374151;
        }
        
        .close-btn {
          background: #ef4444;
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
        
        .crud-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .form-field {
          display: flex;
          flex-direction: column;
        }
        
        .field-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
        }
        
        .required {
          color: #ef4444;
          margin-left: 4px;
        }
        
        .form-field input,
        .form-field textarea {
          padding: 12px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        
        .form-field input:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .checkbox-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .form-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .error-message {
          background: #fef2f2;
          color: #dc2626;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #fecaca;
        }
        
        .table-section {
          padding: 24px;
        }
        
        .table-header h3 {
          margin: 0 0 20px 0;
          color: #374151;
        }
        
        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }
        
        .loading,
        .empty-state {
          padding: 40px;
          text-align: center;
          color: #6b7280;
        }
        
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .data-table th {
          background: #f9fafb;
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        
        .data-table td {
          padding: 16px 12px;
          border-bottom: 1px solid #e5e7eb;
          color: #374151;
        }
        
        .data-row:hover {
          background: #f9fafb;
        }
        
        .actions-header {
          width: 150px;
        }
        
        .actions-cell {
          display: flex;
          gap: 8px;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        
        .btn.primary {
          background: #667eea;
          color: white;
        }
        
        .btn.primary:hover {
          background: #5a67d8;
          transform: translateY(-1px);
        }
        
        .btn.secondary {
          background: #6b7280;
          color: white;
        }
        
        .btn.secondary:hover {
          background: #4b5563;
        }
        
        .btn.ghost {
          background: transparent;
          color: #6b7280;
          border: 1px solid #d1d5db;
        }
        
        .btn.ghost:hover {
          background: #f3f4f6;
        }
        
        .btn.danger {
          background: #ef4444;
          color: white;
        }
        
        .btn.danger:hover {
          background: #dc2626;
        }
        
        .btn.small {
          padding: 6px 12px;
          font-size: 0.75rem;
        }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}


