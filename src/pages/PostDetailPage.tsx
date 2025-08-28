import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { addDoc, collection, doc, getDoc, onSnapshot, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useApp } from '../context/AppProviders'
import { filterBadWords, hasBadWords } from '../utils/filter'

export function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useApp()
  const [post, setPost] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Array<{ id: string; userName?: string; userId?: string; comment: string; createdAt: number }>>([])
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    if (!id) return
    const q = query(collection(db, 'post_comments'), where('postId', '==', id))
    const unsub = onSnapshot(q, (snap) => {
      const list: Array<{ id: string; userName?: string; userId?: string; comment: string; createdAt: number }> = []
      snap.forEach(d => list.push({ id: d.id, ...(d.data() as any) }))
      list.sort((a, b) => b.createdAt - a.createdAt)
      setComments(list)
    })
    return () => unsub()
  }, [id])

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!user) {
      navigate('/login', { state: { redirectTo: `/posts/${id}` } })
      return
    }
    if (!comment.trim()) {
      setError('Vui lòng nhập bình luận')
      return
    }
    if (hasBadWords(comment)) {
      setError('Nội dung có từ ngữ không phù hợp. Vui lòng chỉnh sửa.')
      return
    }
    const masked = filterBadWords(comment.trim())
    const now = Date.now()
    // Anti-spam: ensure last comment by user is >= 5 minutes ago
    const lastQ = query(collection(db, 'post_comments'), where('userId','==', user.uid), orderBy('createdAt','desc'), limit(1))
    const lastSnap = await getDocs(lastQ)
    const last = lastSnap.docs[0]?.data() as any | undefined
    if (last && Number(last.createdAt) && now - Number(last.createdAt) < 5 * 60 * 1000) {
      setError('Bạn chỉ có thể bình luận sau mỗi 5 phút để tránh spam.')
      return
    }
    await addDoc(collection(db, 'post_comments'), {
      postId: id,
      postTitle: post?.title || '',
      targetType: 'POST',
      userId: user.uid,
      userName: user.displayName || user.email || 'User',
      comment: masked,
      createdAt: now,
    })
    setComment('')
  }

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
          <div style={{marginTop:24}}>
            <h3 style={{marginTop:0}}>Bình luận</h3>
            <form onSubmit={submitComment} style={{display:'grid', gap:12}}>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Chia sẻ suy nghĩ của bạn..." rows={4} />
              {error && <div className="muted" style={{color:'#fca5a5'}}>{error}</div>}
              <div style={{display:'flex', justifyContent:'center'}}>
                <button className="btn" type="submit">Gửi bình luận</button>
              </div>
            </form>
            <div style={{marginTop:16, display:'grid', gap:8}}>
              {comments.length === 0 && <div className="muted">Chưa có bình luận nào.</div>}
              {comments.map(c => (
                <div key={c.id} className="card" style={{padding:12}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                    <div style={{fontWeight:700}}>{c.userName || 'Người dùng'}</div>
                    <div className="muted" style={{fontSize:12}}>{new Date(c.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{marginTop:6}}>{c.comment}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
