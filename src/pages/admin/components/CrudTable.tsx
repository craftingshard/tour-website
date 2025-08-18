import { useEffect, useMemo, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '../../../firebase'

type FieldType = 'string' | 'number' | 'boolean' | 'text'

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
    columns.forEach((c) => (f[c.key] = row[c.key] ?? (c.type === 'boolean' ? false : '')))
    setForm(f)
  }

  const onDelete = async (id: string) => {
    if (!confirm('Xóa bản ghi này?')) return
    await deleteDoc(doc(db, collectionName, id))
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
        else payload[c.key] = raw
      }
      if (createDefaults) Object.assign(payload, createDefaults)
      if ('createdAt' in form && !form['createdAt']) payload['createdAt'] = Date.now()

      if (editingId) {
        await updateDoc(doc(db, collectionName, editingId), payload)
      } else {
        await addDoc(colRef, payload)
      }
      resetForm()
    } catch (err: any) {
      setError(err?.message || 'Lỗi lưu dữ liệu')
    }
  }

  return (
    <div className="card">
      <h3 style={{marginTop:0}}>{title}</h3>
      <form onSubmit={onSubmit} style={{display:'grid', gap:8, marginBottom:12}}>
        <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:8}}>
          {columns.map((c) => (
            <label key={c.key} style={{display:'grid', gap:6}}>
              <span>{c.label}</span>
              {c.type === 'boolean' ? (
                <input type="checkbox" checked={!!form[c.key]} onChange={(e)=>onChange(c.key, e.target.checked)} />
              ) : c.type === 'text' ? (
                <textarea rows={4} value={form[c.key] ?? ''} onChange={(e)=>onChange(c.key, e.target.value)} />
              ) : (
                <input type={c.type === 'number' ? 'number' : 'text'} value={form[c.key] ?? ''} onChange={(e)=>onChange(c.key, c.type==='number'? (e.target.value===''?'' : Number(e.target.value)) : e.target.value)} />
              )}
            </label>
          ))}
        </div>
        {error && <div className="muted" style={{color:'#fca5a5'}}>{error}</div>}
        <div style={{display:'flex', gap:8}}>
          <button className="btn primary" type="submit">{editingId ? 'Cập nhật' : 'Thêm mới'}</button>
          {editingId && <button type="button" className="btn" onClick={resetForm}>Hủy</button>}
        </div>
      </form>
      <div className="card" style={{padding:0, overflowX:'auto'}}>
        {loading ? (
          <div style={{padding:12}}>Đang tải...</div>
        ) : (
          <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
              <tr>
                {columns.map(c => <th key={c.key} style={{textAlign:'left', padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,0.08)'}}>{c.label}</th>)}
                <th style={{width:140}}></th>
              </tr>
            </thead>
            <tbody>
              {items.map(row => (
                <tr key={row.id}>
                  {columns.map(c => (
                    <td key={c.key} style={{padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      {c.type==='boolean' ? (row[c.key] ? '✔' : '✖') : String(row[c.key] ?? '')}
                    </td>
                  ))}
                  <td style={{padding:'8px 12px', display:'flex', gap:8}}>
                    <button className="btn" onClick={()=>onEdit(row)}>Sửa</button>
                    <button className="btn ghost" onClick={()=>onDelete(row.id)}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}


