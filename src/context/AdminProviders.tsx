import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

type AdminContextType = {
  loading: boolean
  isAdmin: boolean
  uid: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProviders({ children }: PropsWithChildren) {
  const [uid, setUid] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true)
      try {
        if (user) {
          setUid(user.uid)
          const adminDoc = await getDoc(doc(db, 'admins', user.uid))
          setIsAdmin(adminDoc.exists())
        } else {
          setUid(null)
          setIsAdmin(false)
        }
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snapshot = await getDoc(doc(db, 'admins', cred.user.uid))
    if (!snapshot.exists()) {
      await signOut(auth)
      throw new Error('Tài khoản không có quyền quản trị')
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const value = useMemo(() => ({ loading, isAdmin, uid, login, logout }), [loading, isAdmin, uid])
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProviders')
  return ctx
}


