import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
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
          // Check if user has admin role in custom claims or user metadata
          // For now, we'll check if the user exists in admins collection
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
    console.log('User UID:', cred.user.uid)
    console.log('User Email:', cred.user.email)
    
    // Check if user exists in admins collection
    const adminDocRef = doc(db, 'admins', cred.user.uid)
    console.log('Checking admin document at path:', adminDocRef.path)
    
    const snapshot = await getDoc(adminDocRef)
    console.log('Admin document exists:', snapshot.exists())
    
    if (snapshot.exists()) {
      console.log('Admin document data:', snapshot.data())
    }
    
    if (!snapshot.exists()) {
      console.log('❌ Admin document NOT found - denying access')
      await signOut(auth)
      throw new Error('Tài khoản không có quyền quản trị')
    } else {
      console.log('✅ Admin document found - access granted')
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


