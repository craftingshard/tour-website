/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth, db } from '../firebase'
import { addDoc, collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'

export type Tour = {
  id: string
  title: string
  location: string
  price: number
  rating: number
  hot?: boolean
  imageUrl: string
}

export type Review = {
  id: string
  tourId: string
  userId: string
  userName?: string
  rating: number
  comment: string
  createdAt: number
}

export type Customer = {
  uid: string
  name: string
  email: string
  phone?: string
  vip?: boolean
}

type AppContextType = {
  user: User | null
  tours: Tour[]
  reviewsByTourId: Record<string, Review[]>
  currentCustomer: Customer | null
  viewedTourIds: string[]
  selectedTourIds: string[]
  bookedTourIds: string[]
  toggleSelect: (id: string) => void
  markViewed: (id: string) => void
  bookTour: (id: string) => void
  addReview: (tourId: string, rating: number, comment: string) => void
  saveCustomerProfile: (data: Partial<Customer>) => Promise<void>
  createBooking: (payload: { tourId: string; amount: number; method: 'card' | 'cash'; people: number; startDate: number; notes?: string; paid: boolean }) => Promise<string>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const MOCK_TOURS: Tour[] = [
  { id: 't1', title: 'Hà Giang Hùng Vĩ', location: 'Hà Giang', price: 3290000, rating: 4.8, hot: true, imageUrl: 'https://images.unsplash.com/photo-1545243424-0ce743321e11?q=80&w=1600&auto=format&fit=crop' },
  { id: 't2', title: 'Phú Quốc Biển Xanh', location: 'Phú Quốc', price: 4590000, rating: 4.7, hot: true, imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1600&auto=format&fit=crop' },
  { id: 't3', title: 'Đà Lạt Ngàn Hoa', location: 'Đà Lạt', price: 2890000, rating: 4.6, hot: true, imageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop' },
  { id: 't4', title: 'Sa Pa Mây Trời', location: 'Sa Pa', price: 3790000, rating: 4.9, hot: true, imageUrl: 'https://images.unsplash.com/photo-1526779259212-939e64788e3c?q=80&w=1600&auto=format&fit=crop' },
  { id: 't5', title: 'Hội An Cổ Kính', location: 'Hội An', price: 2590000, rating: 4.7, hot: true, imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1600&auto=format&fit=crop' },
  { id: 't6', title: 'Nha Trang Nắng Vàng', location: 'Nha Trang', price: 3090000, rating: 4.5, hot: true, imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1600&auto=format&fit=crop' },
  { id: 't7', title: 'Côn Đảo Hoang Sơ', location: 'Côn Đảo', price: 5290000, rating: 4.6, hot: true, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop' },
  { id: 't8', title: 'Huế Trầm Mặc', location: 'Huế', price: 2790000, rating: 4.4, hot: true, imageUrl: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1600&auto=format&fit=crop' },
  { id: 't9', title: 'Hạ Long Kỳ Vĩ', location: 'Quảng Ninh', price: 4090000, rating: 4.8, hot: true, imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1600&auto=format&fit=crop' },
  { id: 't10', title: 'Đà Nẵng Năng Động', location: 'Đà Nẵng', price: 2990000, rating: 4.5, hot: true, imageUrl: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?q=80&w=1600&auto=format&fit=crop' },
  { id: 't11', title: 'Mộc Châu Mùa Hoa', location: 'Sơn La', price: 2690000, rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=1600&auto=format&fit=crop' },
  { id: 't12', title: 'Cần Thơ Gạo Trắng', location: 'Cần Thơ', price: 2590000, rating: 4.3, hot: true, imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1600&auto=format&fit=crop' },
  { id: 't13', title: 'Bình Thuận Cát Trắng', location: 'Bình Thuận', price: 2890000, rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1600&auto=format&fit=crop' },
  { id: 't14', title: 'Quy Nhơn Biển Xanh', location: 'Quy Nhơn', price: 3190000, rating: 4.4, imageUrl: 'https://images.unsplash.com/photo-1482192505345-5655af888cc4?q=80&w=1600&auto=format&fit=crop' },
  { id: 't15', title: 'Cà Mau Đất Mũi', location: 'Cà Mau', price: 2790000, rating: 4.2, imageUrl: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?q=80&w=1600&auto=format&fit=crop' },
  { id: 't16', title: 'Buôn Ma Thuột Cà Phê', location: 'Đắk Lắk', price: 2990000, rating: 4.3, imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop' },
  { id: 't17', title: 'Tây Ninh Núi Bà', location: 'Tây Ninh', price: 2190000, rating: 4.1, hot: true, imageUrl: 'https://images.unsplash.com/photo-1542038382126-77ae2819338e?q=80&w=1600&auto=format&fit=crop' },
  { id: 't18', title: 'Vũng Tàu Biển Động', location: 'Vũng Tàu', price: 1990000, rating: 4.0, hot: true, imageUrl: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?q=80&w=1600&auto=format&fit=crop' },
  { id: 't19', title: 'Pleiku Hồ T’Nưng', location: 'Gia Lai', price: 2490000, rating: 4.2, hot: true, imageUrl: 'https://images.unsplash.com/photo-1496568816309-51d7c20e0b09?q=80&w=1600&auto=format&fit=crop' },
]

export function AppProviders({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [tours, setTours] = useState<Tour[]>([])
  const [reviewsByTourId, setReviewsByTourId] = useState<Record<string, Review[]>>({})
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)
  const [viewedTourIds, setViewedTourIds] = useState<string[]>([])
  const [selectedTourIds, setSelectedTourIds] = useState<string[]>([])
  const [bookedTourIds, setBookedTourIds] = useState<string[]>([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser)
    return () => unsub()
  }, [])

  // Map admin_tours -> public tours
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'admin_tours'), (snap) => {
      const list: Tour[] = []
      snap.forEach((d) => {
        const data = d.data() as any
        list.push({
          id: d.id,
          title: data.title || '',
          location: data.location || '',
          price: Number(data.price) || 0,
          rating: Number(data.rating) || 0,
          hot: Boolean(data.hot),
          imageUrl: data.imageUrl || '',
        })
      })
      setTours(list.length ? list : MOCK_TOURS)
    })
    return () => unsub()
  }, [])

  // Load current customer profile
  useEffect(() => {
    if (!user) { setCurrentCustomer(null); return }
    const ref = doc(db, 'customers', user.uid)
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setCurrentCustomer({ uid: snap.id, ...(snap.data() as any) })
      } else {
        setCurrentCustomer(null)
      }
    })
    return () => unsub()
  }, [user])

  const saveCustomerProfile = async (data: Partial<Customer>) => {
    if (!user) throw new Error('Bạn cần đăng nhập')
    const ref = doc(db, 'customers', user.uid)
    const payload = {
      uid: user.uid,
      email: user.email || '',
      name: data.name || currentCustomer?.name || '',
      phone: data.phone ?? currentCustomer?.phone ?? '',
      vip: data.vip ?? currentCustomer?.vip ?? false,
    }
    await setDoc(ref, payload, { merge: true })
  }

  // Reviews realtime
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'reviews'), (snap) => {
      const byId: Record<string, Review[]> = {}
      snap.forEach((d) => {
        const r = { id: d.id, ...(d.data() as any) } as Review
        if (!byId[r.tourId]) byId[r.tourId] = []
        byId[r.tourId].push(r)
      })
      // sort latest first
      Object.keys(byId).forEach(k => byId[k].sort((a,b)=> b.createdAt - a.createdAt))
      setReviewsByTourId(byId)
    })
    return () => unsub()
  }, [])

  // Sync average rating back to tours (admin_tours.rating) based on reviews
  useEffect(() => {
    const sync = async () => {
      const entries = Object.entries(reviewsByTourId)
      for (const [tourId, list] of entries) {
        if (!list.length) continue
        const avg = list.reduce((s, r) => s + r.rating, 0) / list.length
        try {
          await updateDoc(doc(db, 'admin_tours', tourId), { rating: Number(avg.toFixed(1)) })
        } catch {}
      }
    }
    if (Object.keys(reviewsByTourId).length) {
      sync()
    }
  }, [reviewsByTourId])

  const toggleSelect = (id: string) => {
    setSelectedTourIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const markViewed = (id: string) => {
    setViewedTourIds(prev => prev.includes(id) ? prev : [...prev, id])
  }
  const bookTour = (id: string) => {
    setBookedTourIds(prev => prev.includes(id) ? prev : [...prev, id])
  }

  const addReview = async (tourId: string, rating: number, comment: string) => {
    if (!user) return
    const newReview = {
      tourId,
      userId: user.uid,
      userName: user.email || user.displayName || 'User',
      rating: Math.max(1, Math.min(10, Math.round(rating * 2) / 2)),
      comment: comment.trim(),
      createdAt: Date.now(),
    }
    await addDoc(collection(db, 'reviews'), newReview)
  }

  const createBooking = async (payload: { tourId: string; amount: number; method: 'card' | 'cash'; people: number; startDate: number; notes?: string; paid: boolean }) => {
    if (!user) throw new Error('Bạn cần đăng nhập')
    const docRef = await addDoc(collection(db, 'bookings'), {
      userId: user.uid,
      ...payload,
      status: payload.paid ? 'paid' : 'pending',
      createdAt: Date.now(),
    })
    setBookedTourIds(prev => prev.includes(payload.tourId) ? prev : [...prev, payload.tourId])
    return docRef.id
  }

  const value = useMemo(() => ({
    user,
    tours,
    reviewsByTourId,
    currentCustomer,
    viewedTourIds,
    selectedTourIds,
    bookedTourIds,
    toggleSelect,
    markViewed,
    bookTour,
    addReview,
    saveCustomerProfile,
    createBooking,
  }), [user, tours, reviewsByTourId, currentCustomer, viewedTourIds, selectedTourIds, bookedTourIds])

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProviders')
  return ctx
}


