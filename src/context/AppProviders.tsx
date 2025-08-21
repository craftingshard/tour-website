/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth, db } from '../firebase'
import { addDoc, collection, doc, onSnapshot, setDoc, updateDoc, query, where, getDocs, getDoc } from 'firebase/firestore'

export type Tour = {
  id: string
  title: string
  location: string
  price: number
  rating: number
  hot?: boolean
  imageUrl: string
  approved?: boolean
  createdBy?: string
  createdByName?: string
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
  createBooking: (payload: { tourId: string; amount: number; method: 'cash' | 'bank_transfer'; people: number; startDate: number; endDate?: number; notes?: string; paid: boolean; bankId?: string; bankName?: string; payLater?: boolean }) => Promise<string>
  cancelBooking: (tourId: string) => Promise<void>
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

  // Load tours from both admin_tours and TOURS collections with robust fallbacks
  useEffect(() => {
    let unsubscribePrimary: (() => void) | null = null
    let unsubscribeFallback: (() => void) | null = null

    const subscribeAdminTours = () => {
      try {
        unsubscribeFallback = onSnapshot(collection(db, 'admin_tours'), (adminSnap) => {
          const adminToursList: Tour[] = []
          adminSnap.forEach((d) => {
            const data = d.data() as any
            adminToursList.push({
              id: d.id,
              title: data.title || '',
              location: data.location || '',
              price: Number(data.price) || 0,
              rating: Number(data.rating) || 0,
              hot: Boolean(data.hot),
              imageUrl: data.imageUrl || data.image || data.photo || data.thumbnail || data.picture || 'https://images.unsplash.com/photo-1545243424-0ce743321e11?q=80&w=1600&auto=format&fit=crop',
              approved: Boolean(data.approved),
              createdBy: data.createdBy,
              createdByName: data.createdByName,
            })
          })
          if (adminToursList.length > 0) {
            console.log('Loaded tours from admin_tours collection:', adminToursList.length)
            setTours(adminToursList)
          } else {
            console.log('Using mock tours')
            setTours(MOCK_TOURS)
          }
        }, (err) => {
          console.warn('admin_tours snapshot error:', err)
          setTours(MOCK_TOURS)
        })
      } catch (e) {
        setTours(MOCK_TOURS)
      }
    }

    try {
      unsubscribePrimary = onSnapshot(collection(db, 'TOURS'), (snap) => {
        const toursList: Tour[] = []
        snap.forEach((d) => {
          const data = d.data() as any
          toursList.push({
            id: d.id,
            title: data.title || data.name || '',
            location: data.location || data.destination || '',
            price: Number(data.price) || 0,
            rating: Number(data.rating) || 0,
            hot: Boolean(data.hot || data.featured),
            imageUrl: data.imageUrl || data.image || data.photo || data.thumbnail || data.picture || 'https://images.unsplash.com/photo-1545243424-0ce743321e11?q=80&w=1600&auto=format&fit=crop',
            approved: Boolean(data.approved),
            createdBy: data.createdBy,
            createdByName: data.createdByName,
          })
        })

        if (toursList.length > 0) {
          console.log('Loaded tours from TOURS collection:', toursList.length)
          setTours(toursList)
        } else {
          subscribeAdminTours()
        }
      }, (err) => {
        console.warn('TOURS snapshot error:', err)
        subscribeAdminTours()
      })
    } catch (e) {
      subscribeAdminTours()
    }

    return () => {
      if (unsubscribePrimary) unsubscribePrimary()
      if (unsubscribeFallback) unsubscribeFallback()
    }
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
      userName: user.displayName || user.email || 'User',
      rating: Math.max(1, Math.min(10, Math.round(rating * 2) / 2)),
      comment: comment.trim(),
      createdAt: Date.now(),
    }
    await addDoc(collection(db, 'reviews'), newReview)
  }

  const createBooking = async (payload: { tourId: string; amount: number; method: 'cash' | 'bank_transfer'; people: number; startDate: number; endDate?: number; notes?: string; paid: boolean; bankId?: string; bankName?: string; payLater?: boolean }) => {
    if (!user) throw new Error('Bạn cần đăng nhập')
    // Validate dates
    const start = Number(payload.startDate)
    if (!start || isNaN(start)) throw new Error('Ngày khởi hành không hợp lệ')
    const today = new Date(); today.setHours(0,0,0,0)
    if (start < today.getTime()) throw new Error('Ngày khởi hành không thể ở quá khứ')
    if (payload.endDate) {
      const end = Number(payload.endDate)
      if (isNaN(end) || end <= start) throw new Error('Ngày kết thúc phải sau ngày khởi hành')
    }

    // Duplicate booking check (same user, tour, date and active status)
    const dupQ = query(collection(db, 'bookings'), where('userId','==', user.uid), where('tourId','==', payload.tourId))
    const dupSnap = await getDocs(dupQ)
    const hasDup = dupSnap.docs.some(d => {
      const b = d.data() as any
      const status = String(b.status || '')
      const active = ['pending','paid','confirmed','completed']
      const sameStart = Number(b.startDate || b.travelDate) === start
      return active.includes(status) && sameStart
    })
    if (hasDup) throw new Error('Bạn đã đặt tour này cho ngày này rồi')
    const safePayload = {
      tourId: payload.tourId,
      amount: Number(payload.amount) || 0,
      method: payload.method,
      people: Number(payload.people) || 0,
      startDate: Number(payload.startDate) || Date.now(),
      endDate: payload.endDate ? Number(payload.endDate) : undefined,
      notes: payload.notes || '',
      paid: Boolean(payload.paid),
      bankId: payload.bankId || null,
      bankName: payload.bankName || null,
      payLater: Boolean(payload.payLater),
    }
    const docRef = await addDoc(collection(db, 'bookings'), {
      userId: user.uid,
      customerName: user.displayName || user.email || 'Khách hàng',
      customerEmail: user.email || '',
      customerPhone: user.phoneNumber || '',
      ...safePayload,
      bookingDate: new Date(), // Ngày đặt tour luôn là hôm nay
      status: safePayload.paid ? 'paid' : 'pending',
      createdAt: Date.now(),
    })
    // Notifications to admins and tour creator
    try {
      const tourDoc = await getDoc(doc(db, 'TOURS', payload.tourId))
      const tData: any = tourDoc.exists() ? tourDoc.data() : {}
      const creatorId = tData?.createdBy
      const notifBase = {
        type: 'booking_created',
        tourId: payload.tourId,
        bookingId: docRef.id,
        userId: user.uid,
        createdAt: Date.now(),
        message: `Có đơn đặt tour mới: ${tData?.title || tData?.name || ''}`,
        read: false,
      }
      await addDoc(collection(db, 'notifications'), { ...notifBase, recipientRole: 'admin' })
      if (creatorId) {
        await addDoc(collection(db, 'notifications'), { ...notifBase, recipientId: creatorId })
      }
    } catch {}
    setBookedTourIds(prev => prev.includes(payload.tourId) ? prev : [...prev, payload.tourId])
    return docRef.id
  }

  const cancelBooking = async (tourId: string) => {
    if (!user) throw new Error('Bạn cần đăng nhập')
    const qBk = query(collection(db, 'bookings'), where('userId','==', user.uid), where('tourId','==', tourId))
    const snap = await getDocs(qBk)
    let latestId: string | null = null
    let latestCreated = -1
    snap.forEach(d => {
      const b = d.data() as any
      const status = String(b.status || '')
      if (['cancelled','completed'].includes(status)) return
      const created = Number(b.createdAt || 0)
      if (created > latestCreated) { latestCreated = created; latestId = d.id }
    })
    if (!latestId) throw new Error('Không có đặt chỗ nào để hủy')
    await updateDoc(doc(db, 'bookings', latestId), { status: 'cancelled', updatedAt: Date.now() })
    setBookedTourIds(prev => prev.filter(x => x !== tourId))
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
    cancelBooking,
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


