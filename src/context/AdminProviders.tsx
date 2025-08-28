import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { db } from '../firebase'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

export type UserRole = 'admin' | 'manager' | 'staff' | 'partner'

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
          // Check if user exists in admins collection first
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
            // Check if user is an approved partner
            const partnerQuery = query(
              collection(db, 'partners'),
              where('userId', '==', user.uid),
              where('status', '==', 'approved')
            )
            const partnerSnapshot = await getDocs(partnerQuery)
            
            if (!partnerSnapshot.empty) {
              const partnerData = partnerSnapshot.docs[0].data()
              const partnerUser: AdminUser = {
                uid: user.uid,
                name: partnerData.fullName || partnerData.name || user.displayName || 'Partner',
                email: user.email || '',
                role: 'partner',
                active: true,
                department: 'Partner',
                position: 'Tour Partner'
              }
              setCurrentUser(partnerUser)
            } else {
              setCurrentUser(null)
            }
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
    
    let isAuthorized = false

    const adminDocRef = doc(db, 'admins', cred.user.uid)
    const adminSnapshot = await getDoc(adminDocRef)
    if (adminSnapshot.exists() && adminSnapshot.data().active !== false) {
      isAuthorized = true
    }

    if (!isAuthorized) {
      const partnerQuery = query(
        collection(db, 'partners'),
        where('userId', '==', cred.user.uid),
        where('status', '==', 'approved')
      )
      const partnerSnapshot = await getDocs(partnerQuery)
      if (!partnerSnapshot.empty) {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      const customerDoc = await getDoc(doc(db, 'customers', cred.user.uid))
      if (customerDoc.exists() && customerDoc.data().role === 'customer' && customerDoc.data().status === 'active') {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      await signOut(auth)
      throw new Error('Tài khoản không có quyền truy cập hệ thống hoặc chưa được duyệt')
    }
    console.log("Đăng nhập thành công")
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
        // Manager can delete comments
        if (action === 'delete' && (resource === 'comments' || resource === 'reviews' || resource === 'post_comments')) return true
        // Manager can create, read, update otherwise
        return action !== 'delete'

      case 'staff':
        // Staff can only create and update specific resources
        if (action === 'delete') return false
        if (action === 'read' && resource === 'dashboard') return false
        
        // Staff can only work with POSTS, TOURS, and bookings
        if (resource && !['POSTS', 'TOURS', 'bookings'].includes(resource)) {
          return false
        }
        
        return action === 'create' || action === 'update' || action === 'read'

      case 'partner':
        // Partners can only work with TOURS and view bookings for their tours
        if (action === 'delete') return false
        
        // Partners can only work with TOURS and bookings
        if (resource && !['TOURS', 'tours'].includes(resource)) {
          return false
        }
        
        return action === 'create' || action === 'update' || action === 'read'

      default:
        return false
    }
  }

  const canAccessDashboard = (): boolean => {
    if (!currentUser) return false
    return currentUser.role === 'admin' || currentUser.role === 'manager' || currentUser.role === 'partner'
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


