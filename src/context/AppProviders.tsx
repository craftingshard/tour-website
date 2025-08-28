/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth, db } from '../firebase'
import { addDoc, collection, doc, onSnapshot, setDoc, updateDoc, query, where, getDocs, getDoc, writeBatch, orderBy, limit } from 'firebase/firestore'
import { filterBadWords } from '../utils/filter';

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
  address?: string
  role?: 'customer'
  status: 'active' | 'inactive',
  createdAt?: number
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
  saveCustomerProfile: (data: Partial<Customer>, uid?: string) => Promise<void>
  createBooking: (payload: { tourId: string; customerPhone:string; amount: number; method: 'cash' | 'bank_transfer'; people: number; startDate: number; endDate?: number; notes?: string; paid: boolean; bankId?: string; bankName?: string; payLater?: boolean }) => Promise<string>
  cancelBooking: (tourId: string) => Promise<void>
}


const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProviders({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null)
  const [tours, setTours] = useState<Tour[]>([])
  const [reviewsByTourId, setReviewsByTourId] = useState<Record<string, Review[]>>({})
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)
  const [viewedTourIds, setViewedTourIds] = useState<string[]>([])
  const [selectedTourIds, setSelectedTourIds] = useState<string[]>([])
  const [bookedTourIds, setBookedTourIds] = useState<string[]>([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (newUser) => {
      setUser(newUser);
      if (!newUser) {
        setCurrentCustomer(null);
        setBookedTourIds([]);
      }
    });
    return () => unsub()
  }, [])

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
              imageUrl: data.imageUrl || data.image,
              approved: Boolean(data.approved),
              createdBy: data.createdBy,
              createdByName: data.createdByName,
            })
          })
          if (adminToursList.length > 0) {
            console.log('Loaded tours from admin_tours collection:', adminToursList.length)
            setTours(adminToursList)
          } else {
                console.warn('No tours found in admin_tours, falling back to TOURS collection')
          }
        }, (err) => {
            console.warn('admin_tours snapshot error:', err)
        })
      } catch (e) {   }
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
            imageUrl: data.imageUrl || data.image,
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

  const saveCustomerProfile = async (data: Partial<Customer>, uid?: string) => {
    const targetUid = uid || user?.uid;
    if (!targetUid) throw new Error('Bạn cần đăng nhập hoặc cung cấp UID.');
    const ref = doc(db, 'customers', targetUid);
    const existingDoc = await getDoc(ref);
    const existingData = existingDoc.data() as Partial<Customer> || {};
    const payload = {
    uid: targetUid,
    email: data.email || user?.email || '',
    name: data.name || existingData.name || user?.displayName || '',
    phone: data.phone ?? existingData.phone ?? '',
    vip: data.vip ?? existingData.vip ?? false,
    address: data.address || existingData.address || '',
    role: data.role || existingData.role || 'customer',
    status: data.status || existingData.status || 'active',
    updatedAt: Date.now(),
    createdAt: existingData.createdAt || Date.now()
  };
    await setDoc(ref, payload, { merge: true })
  }

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'reviews'), (snap) => {
      const byId: Record<string, Review[]> = {}
      snap.forEach((d) => {
        const r = { id: d.id, ...(d.data() as any) } as Review
        if (!byId[r.tourId]) byId[r.tourId] = []
        byId[r.tourId].push(r)
      })
      Object.keys(byId).forEach(k => byId[k].sort((a,b)=> b.createdAt - a.createdAt))
      setReviewsByTourId(byId)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    const sync = async () => {
      if (!Object.keys(reviewsByTourId).length) return;

      const batch = writeBatch(db);
      const entries = Object.entries(reviewsByTourId);
      for (const [tourId, list] of entries) {
        if (!list.length) continue;
        const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
        const ratingPayload = { rating: Number(avg.toFixed(1)) } as any;
        const adminRef = doc(db, 'admin_tours', tourId);
        const toursRef = doc(db, 'TOURS', tourId);
        batch.set(adminRef, ratingPayload, { merge: true });
        batch.set(toursRef, ratingPayload, { merge: true });
      }
      try {
        await batch.commit();
        console.log('Successfully synced tour ratings to TOURS and admin_tours.');
      } catch (e) {
        console.error('Failed to sync tour ratings:', e);
      }
    };
    sync();
  }, [reviewsByTourId]);

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
    const now = Date.now()
    // Anti-spam: ensure last review by user is >= 5 minutes ago
    const lastQ = query(collection(db, 'reviews'), where('userId','==', user.uid), orderBy('createdAt','desc'), limit(1))
    const lastSnap = await getDocs(lastQ)
    const last = lastSnap.docs[0]?.data() as any | undefined
    if (last && Number(last.createdAt) && now - Number(last.createdAt) < 5 * 60 * 1000) {
      throw new Error('Bạn chỉ có thể bình luận sau mỗi 5 phút để tránh spam.')
    }

    const filteredComment = filterBadWords(comment.trim())
    const tourTitle = tours.find(t => t.id === tourId)?.title || ''
    const newReview = {
      tourId,
      tourTitle,
      targetType: 'TOUR',
      userId: user.uid,
      userName: user.displayName || user.email || 'User',
      rating: Math.max(1, Math.min(10, Math.round(rating * 2) / 2)),
      comment: filteredComment,
      createdAt: now,
    }
    await addDoc(collection(db, 'reviews'), newReview)
  }

  const createBooking = async (payload: { tourId: string; customerPhone: string; amount: number; method: 'cash' | 'bank_transfer'; people: number; startDate: number; endDate?: number; notes?: string; paid: boolean; bankId?: string; bankName?: string; payLater?: boolean }) => {
    if (!user) throw new Error('Bạn cần đăng nhập')
    const start = Number(payload.startDate)
    if (!start || isNaN(start)) throw new Error('Ngày khởi hành không hợp lệ')
    const today = new Date(); today.setHours(0,0,0,0)
    if (start < today.getTime()) throw new Error('Ngày khởi hành không thể ở quá khứ')
    if (payload.endDate) {
      const end = Number(payload.endDate)
      if (isNaN(end) || end <= start) throw new Error('Ngày kết thúc phải sau ngày khởi hành')
    }

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
    
    const bookingData = {
      userId: user.uid,
      customerName: user.displayName || user.email || 'Khách hàng',
      customerEmail: user.email || '',
      
      tourId: payload.tourId,
      amount: Number(payload.amount) || 0,
      method: payload.method,
      people: Number(payload.people) || 0,
      startDate: Number(payload.startDate) || Date.now(),
      endDate: payload.endDate ? Number(payload.endDate) : Date.now() + (24 * 60 * 60 * 1000),
      notes: payload.notes || '',
      paid: Boolean(payload.paid),
      bankId: payload.bankId || null,
      bankName: payload.bankName || null,
      payLater: Boolean(payload.payLater),
      customerPhone: payload.customerPhone || '',
      bookingDate: new Date(), 
      status: payload.paid ? 'paid' : 'pending',
      createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(db, 'bookings'), bookingData);
    
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
