import { useEffect, useState } from 'react'
import { collection, getDocs, query, limit } from 'firebase/firestore'
import { db } from '../firebase'

export function Footer() {
  const [settings, setSettings] = useState<any | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'settings'), limit(1)))
        if (!snap.empty) setSettings({ id: snap.docs[0].id, ...snap.docs[0].data() })
      } catch {}
    }
    load()
  }, [])

  return (
    <footer style={{borderTop: '1px solid rgba(255,255,255,.08)', padding: '16px'}}>
      <div className="container" style={{display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8}}>
        <div>© {new Date().getFullYear()} {settings?.siteName || 'VN Tour'}</div>
        <div className="muted">Liên hệ: {settings?.hotline || settings?.primaryPhone || settings?.supportEmail || 'support@vntour.example'}</div>
      </div>
    </footer>
  )
}


