import { useEffect, useMemo, useState } from 'react'
import { collection, deleteDoc, doc, getDocs, limit, orderBy, query } from 'firebase/firestore'
import { db } from '../../firebase'
import { useAdmin } from '../../context/AdminProviders'

export function CommentsPage() {
  const { hasPermission } = useAdmin()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Array<{ id: string; source: 'review' | 'post'; content: string; title: string; targetId: string; createdAt: number }>>([])
  const [page, setPage] = useState(1)
  const pageSize = 10

  const load = async () => {
    setLoading(true)
    try {
      const rSnap = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt','desc'), limit(100)))
      const reviews = rSnap.docs.map(d => ({
        id: d.id,
        source: 'review' as const,
        content: (d.data() as any).comment || '',
        title: (d.data() as any).tourTitle || 'Tour',
        targetId: (d.data() as any).tourId || '',
        createdAt: Number((d.data() as any).createdAt) || 0,
      }))

      const pSnap = await getDocs(query(collection(db, 'post_comments'), orderBy('createdAt','desc'), limit(100)))
      const posts = pSnap.docs.map(d => ({
        id: d.id,
        source: 'post' as const,
        content: (d.data() as any).comment || '',
        title: (d.data() as any).postTitle || 'Bài viết',
        targetId: (d.data() as any).postId || '',
        createdAt: Number((d.data() as any).createdAt) || 0,
      }))

      const merged = [...reviews, ...posts].sort((a,b)=> b.createdAt - a.createdAt)
      setItems(merged)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (row: { id: string; source: 'review' | 'post' }) => {
    if (!hasPermission('delete', row.source === 'review' ? 'reviews' : 'post_comments')) return
    const coll = row.source === 'review' ? 'reviews' : 'post_comments'
    await deleteDoc(doc(db, coll, row.id))
    await load()
  }

  const totalPages = Math.ceil(items.length / pageSize)
  const currentItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, page])

  return (
    <div className="crud-container" style={{background:'white', borderRadius:12, boxShadow:'0 4px 6px -1px rgba(0,0,0,.1)', overflow:'hidden'}}>
      <div className="crud-header" style={{background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color:'#fff', padding:24, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2 style={{margin:0}}>Quản lý bình luận</h2>
      </div>
      {loading ? (
        <div style={{padding:24}}>Đang tải...</div>
      ) : (
        <div className="table-section" style={{padding:24}}>
          <div className="table-container" style={{background:'white', borderRadius:8, overflow:'hidden', boxShadow:'0 1px 3px 0 rgba(0,0,0,0.1)'}}>
          <table className="data-table" style={{width:'100%', minWidth:800, borderCollapse:'collapse', fontSize:14}}>
            <thead>
              <tr>
                <th style={{textAlign:'left', padding:'16px 12px', background:'#f9fafb', borderBottom:'2px solid #e5e7eb'}}>STT</th>
                <th style={{textAlign:'left', padding:'16px 12px', background:'#f9fafb', borderBottom:'2px solid #e5e7eb'}}>Nguồn</th>
                <th style={{textAlign:'left', padding:'16px 12px', background:'#f9fafb', borderBottom:'2px solid #e5e7eb'}}>Nội dung</th>
                <th style={{textAlign:'left', padding:'16px 12px', background:'#f9fafb', borderBottom:'2px solid #e5e7eb'}}>Tên</th>
                <th style={{textAlign:'left', padding:'16px 12px', background:'#f9fafb', borderBottom:'2px solid #e5e7eb'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((c, idx) => (
                <tr key={`${c.source}-${c.id}`}>
                  <td style={{padding:'16px 12px', borderBottom:'1px solid #f3f4f6'}}>{(page - 1) * pageSize + idx + 1}</td>
                  <td style={{padding:'16px 12px', borderBottom:'1px solid #f3f4f6'}}>{c.source === 'review' ? 'Tour' : 'Post'}</td>
                  <td style={{padding:'16px 12px', borderBottom:'1px solid #f3f4f6', maxWidth:480, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{c.content}</td>
                  <td style={{padding:'16px 12px', borderBottom:'1px solid #f3f4f6'}}>
                    {c.source === 'review' ? (
                      <a href={`#/tours/${c.targetId}`} style={{color:'#3b82f6'}}>{c.title || c.targetId}</a>
                    ) : (
                      <a href={`#/posts/${c.targetId}`} style={{color:'#3b82f6'}}>{c.title || c.targetId}</a>
                    )}
                  </td>
                  <td style={{padding:'16px 12px', borderBottom:'1px solid #f3f4f6'}}>
                    {hasPermission('delete', c.source === 'review' ? 'reviews' : 'post_comments') && (
                      <div style={{display:'inline-flex', gap:8}}>
                        <button className="btn" onClick={() => handleDelete(c)}>Xóa</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {totalPages > 1 && (
            <div className="pagination-controls" style={{display:'flex', justifyContent:'center', alignItems:'center', gap:16, marginTop:24, padding:16}}>
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Trước</button>
              <span>Trang {page} / {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>Sau</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


