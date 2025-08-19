import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

export type UserRole = 'admin' | 'manager' | 'staff'

export type AdminUser = {
  uid: string
  name: string
  email: string
  role: UserRole
  active: boolean
  department?: string
  position?: string
}

type AdminContextType = {
  loading: boolean
  isAuthenticated: boolean
  currentUser: AdminUser | null
  uid: string | null
  role: UserRole | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (action: 'create' | 'read' | 'update' | 'delete', resource?: string) => boolean
  canAccessDashboard: () => boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProviders({ children }: PropsWithChildren) {
  const [uid, setUid] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true)
      try {
        if (user) {
          setUid(user.uid)
          // Check if user exists in admins collection and get their role
          const adminDoc = await getDoc(doc(db, 'admins', user.uid))
          
          if (adminDoc.exists()) {
            const userData = adminDoc.data()
            const adminUser: AdminUser = {
              uid: user.uid,
              name: userData.name || userData.displayName || user.displayName || 'Admin User',
              email: user.email || '',
              role: userData.role || 'staff',
              active: userData.active !== false, // default to true if not specified
              department: userData.department,
              position: userData.position
            }
            setCurrentUser(adminUser)
          } else {
            setCurrentUser(null)
          }
        } else {
          setUid(null)
          setCurrentUser(null)
        }
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    
    // Check if user exists in admins collection
    const adminDocRef = doc(db, 'admins', cred.user.uid)
    const snapshot = await getDoc(adminDocRef)
    
    if (snapshot.exists()) {
      const userData = snapshot.data()
      
      // Check if user is active
      if (userData.active === false) {
        await signOut(auth)
        throw new Error('Tài khoản đã bị vô hiệu hóa')
      }
      
      const adminUser: AdminUser = {
        uid: cred.user.uid,
        name: userData.name || userData.displayName || cred.user.displayName || 'Admin User',
        email: cred.user.email || '',
        role: userData.role || 'staff',
        active: userData.active !== false,
        department: userData.department,
        position: userData.position
      }
      
      // Update state immediately for better UX
      setUid(cred.user.uid)
      setCurrentUser(adminUser)
    } else {
      await signOut(auth)
      throw new Error('Tài khoản không có quyền truy cập hệ thống')
    }
  }

  const logout = async () => {
    await signOut(auth)
    setUid(null)
    setCurrentUser(null)
  }

  const hasPermission = (action: 'create' | 'read' | 'update' | 'delete', resource?: string): boolean => {
    if (!currentUser || !currentUser.active) return false

    const { role } = currentUser

    switch (role) {
      case 'admin':
        return true // Admin has all permissions

      case 'manager':
        // Manager can create, read, update but not delete
        return action !== 'delete'

      case 'staff':
        // Staff can only create and update specific resources
        if (action === 'delete') return false
        if (action === 'read' && resource === 'dashboard') return false
        
        // Staff can only work with POSTS, TOURS, and bookings
        if (resource && !['POSTS', 'TOURS', 'bookings', 'posts', 'tours'].includes(resource)) {
          return false
        }
        
        return action === 'create' || action === 'update' || action === 'read'

      default:
        return false
    }
  }

  const canAccessDashboard = (): boolean => {
    if (!currentUser) return false
    return currentUser.role === 'admin' || currentUser.role === 'manager'
  }

  const value = useMemo(() => ({
    loading,
    isAuthenticated: !!currentUser,
    currentUser,
    uid,
    role: currentUser?.role || null,
    login,
    logout,
    hasPermission,
    canAccessDashboard
  }), [loading, currentUser, uid])

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProviders')
  return ctx
}


