import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

export function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      try {
        setLoading(true)
        const snap = await getDoc(doc(db, 'POSTS', id))
        if (snap.exists()) {
          setPost({ id: snap.id, ...snap.data() })
        } else {
          setPost(null)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const formatDate = (d: any) => {
    if (!d) return '-'
    if (d?.toDate) return d.toDate().toLocaleDateString('vi-VN')
    return new Date(d).toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading-section">
          <div className="loading-spinner">🔄</div>
          <p>Đang tải bài viết...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="container">
        <div className="card">
          <p>Bài viết không tồn tại.</p>
          <button className="btn" onClick={() => navigate(-1)}>Quay lại</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card" style={{overflow:'hidden', padding:0}}>
        {post.imageUrl && (
          <img src={post.imageUrl} alt={post.title} style={{width:'100%', height:360, objectFit:'cover'}} />
        )}
        <div style={{padding:16}}>
          <button className="btn ghost" onClick={() => navigate(-1)}>← Quay lại</button>
          <h1 style={{margin:'12px 0'}}>{post.title}</h1>
          <div className="muted" style={{display:'flex', gap:12, alignItems:'center'}}>
            <span>✍️ {post.author || 'Admin'}</span>
            <span>•</span>
            <span>📅 {formatDate(post.publishedAt || post.createdAt)}</span>
            {post.category && (
              <>
                <span>•</span>
                <span>🏷️ {post.category}</span>
              </>
            )}
          </div>
          {post.excerpt && <p style={{marginTop:12}}><i>{post.excerpt}</i></p>}
          <div style={{marginTop:12, lineHeight:1.7}}>
            {post.content ? (
              <div dangerouslySetInnerHTML={{ __html: String(post.content).replace(/\n/g, '<br/>') }} />
            ) : (
              <p>Không có nội dung chi tiết.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
