import { db } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'

// Sample tour data
const sampleTours = [
  {
    name: "Hạ Long Bay - Vịnh Diệu Kỳ",
    description: "Khám phá vẻ đẹp huyền bí của Vịnh Hạ Long với hàng nghìn hòn đảo đá vôi và hang động kỳ vĩ.",
    price: 2500000,
    duration: "3 ngày 2 đêm",
    location: "Quảng Ninh, Việt Nam",
    rating: 4.8,
    imageUrl: "https://picsum.photos/400/650?random=1",
    category: "Biển",
    highlights: ["Kayak", "Thăm hang động", "Ăn hải sản", "Ngắm hoàng hôn"],
    included: ["Vé máy bay", "Khách sạn 4 sao", "Ăn uống", "Hướng dẫn viên"],
    excluded: ["Chi phí cá nhân", "Bảo hiểm", "Tips"],
    maxGroupSize: 15,
    
    bestTime: "Tháng 3-5, 9-11"
  },
  {
    name: "Sapa - Núi Rừng Tây Bắc",
    description: "Chinh phục đỉnh Fansipan và khám phá văn hóa độc đáo của các dân tộc thiểu số.",
    price: 1800000,
    duration: "4 ngày 3 đêm",
    location: "Lào Cai, Việt Nam",
    rating: 4.7,
    imageUrl: "https://picsum.photos/400/650?random=2",
    category: "Núi",
    highlights: ["Leo Fansipan", "Trekking", "Homestay", "Chợ phiên"],
    included: ["Vé xe", "Homestay", "Ăn uống", "Hướng dẫn viên"],
    excluded: ["Vé cáp treo", "Chi phí cá nhân", "Bảo hiểm"],
    maxGroupSize: 12,
    
    bestTime: "Tháng 9-11, 3-5"
  }
]

// Sample posts data
const samplePosts = [
  {
    title: "10 Điểm Du Lịch Không Thể Bỏ Qua Ở Việt Nam",
    content: "Việt Nam là một đất nước xinh đẹp với nhiều điểm du lịch hấp dẫn...",
    author: "Admin",
    category: "Du lịch",
    tags: ["Việt Nam", "Du lịch", "Khám phá"],
    imageUrl: "https://picsum.photos/400/650?random=20",
    publishedAt: new Date(),
    readTime: "8 phút",
    views: 1200,
    likes: 89
  },
  {
    title: "Hướng Dẫn Du Lịch Sapa Mùa Thu",
    content: "Sapa mùa thu là thời điểm đẹp nhất để khám phá vùng núi Tây Bắc...",
    author: "Admin",
    category: "Hướng dẫn",
    tags: ["Sapa", "Mùa thu", "Tây Bắc"],
    imageUrl: "https://picsum.photos/400/650?random=21",
    publishedAt: new Date(),
    readTime: "6 phút",
    views: 850,
    likes: 67
  }
]

// Sample customers data
const sampleCustomers = [
  {
    displayName: "Nguyễn Văn An",
    email: "nguyenvanan@email.com",
    phoneNumber: "0901234567",
    role: "customer",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    dateOfBirth: "1990-05-15",
    preferences: ["Biển", "Văn hóa", "Ẩm thực"],
    totalBookings: 3,
    totalSpent: 8500000,
    createdAt: new Date()
  },
  {
    displayName: "Trần Thị Bình",
    email: "tranthibinh@email.com",
    phoneNumber: "0912345678",
    role: "customer",
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    dateOfBirth: "1985-08-22",
    preferences: ["Núi", "Trekking", "Homestay"],
    totalBookings: 5,
    totalSpent: 12000000,
    createdAt: new Date()
  }
]

// Sample staff data
const sampleStaff = [
  {
    displayName: "Nguyễn Văn Admin",
    email: "admin@tourwebsite.com",
    role: "admin",
    uid: "admin001",
    department: "Quản lý",
    position: "Quản lý tổng",
    phoneNumber: "0900000001",
    salary: 25000000,
    hireDate: "2023-01-15",
    status: "active",
    permissions: ["all"],
    createdAt: new Date()
  },
  {
    displayName: "Trần Thị Manager",
    email: "manager@tourwebsite.com",
    role: "manager",
    uid: "manager001",
    department: "Kinh doanh",
    position: "Trưởng phòng kinh doanh",
    phoneNumber: "0900000002",
    salary: 18000000,
    hireDate: "2023-03-20",
    status: "active",
    permissions: ["tours", "bookings", "customers"],
    createdAt: new Date()
  }
]

// Sample affiliates data
const sampleAffiliates = [
  {
    name: "Công ty Du lịch ABC",
    email: "info@abctravel.com",
    phone: "02812345678",
    website: "https://abctravel.com",
    commission: 15,
    status: "active",
    active: true,
    address: "123 Đường ABC, Quận 1, TP.HCM",
    contactPerson: "Nguyễn Văn A",
    contactPhone: "0901234567",
    bankAccount: "1234567890",
    bankName: "Vietcombank",
    totalEarnings: 25000000,
    paidAmount: 15000000,
    pendingAmount: 10000000,
    totalBookings: 45,
    conversionRate: 8.5,
    createdAt: new Date()
  },
  {
    name: "Công ty Lữ hành XYZ",
    email: "contact@xyztravel.com",
    phone: "02823456789",
    website: "https://xyztravel.com",
    commission: 12,
    status: "active",
    active: true,
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    contactPerson: "Trần Thị B",
    contactPhone: "0912345678",
    bankAccount: "2345678901",
    bankName: "BIDV",
    totalEarnings: 18000000,
    paidAmount: 12000000,
    pendingAmount: 6000000,
    totalBookings: 32,
    conversionRate: 7.2,
    createdAt: new Date()
  }
]

// Sample bookings data
const sampleBookings = [
  {
    userId: "customer001",
    tourId: "tour001",
    tourName: "Hạ Long Bay - Vịnh Diệu Kỳ",
    customerName: "Nguyễn Văn An",
    customerEmail: "nguyenvanan@email.com",
    customerPhone: "0901234567",
    status: "confirmed",
    paid: true,
    amount: 2500000,
    affiliateId: "affiliate001",
    affiliateName: "Công ty Du lịch ABC",
    commission: 375000,
    bookingDate: new Date("2024-01-15"),
    travelDate: new Date("2024-03-20"),
    numberOfPeople: 2,
    specialRequests: "Yêu cầu phòng view biển",
    paymentMethod: "bank_transfer",
    notes: "Khách hàng VIP"
  },
  {
    userId: "customer002",
    tourId: "tour002",
    tourName: "Sapa - Núi Rừng Tây Bắc",
    customerName: "Trần Thị Bình",
    customerEmail: "tranthibinh@email.com",
    customerPhone: "0912345678",
    status: "confirmed",
    paid: true,
    amount: 1800000,
    affiliateId: "affiliate002",
    affiliateName: "Công ty Lữ hành XYZ",
    commission: 216000,
    bookingDate: new Date("2024-01-18"),
    travelDate: new Date("2024-04-15"),
    numberOfPeople: 1,
    specialRequests: "Homestay với người dân địa phương",
    paymentMethod: "credit_card",
    notes: "Khách thích trekking"
  }
]

// Function to seed tours data
export const seedToursData = async () => {
  try {
    console.log('🌱 Bắt đầu thêm dữ liệu tours...')
    
    for (let i = 0; i < sampleTours.length; i++) {
      const tour = sampleTours[i]
      await addDoc(collection(db, 'TOURS'), {
        ...tour,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        featured: i < 5,
        slug: tour.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '')
      })
      console.log(`✅ Đã thêm tour: ${tour.name}`)
    }
    
    console.log(`🎉 Hoàn thành! Đã thêm ${sampleTours.length} tours`)
    return { success: true, count: sampleTours.length }
  } catch (error) {
    console.error('❌ Lỗi khi thêm tours:', error)
    return { success: false, error }
  }
}

// Function to seed posts data
export const seedPostsData = async () => {
  try {
    console.log('🌱 Bắt đầu thêm dữ liệu posts...')
    
    for (let i = 0; i < samplePosts.length; i++) {
      const post = samplePosts[i]
      await addDoc(collection(db, 'POSTS'), {
        ...post,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'published',
        featured: i < 3,
        slug: post.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '')
      })
      console.log(`✅ Đã thêm post: ${post.title}`)
    }
    
    console.log(`🎉 Hoàn thành! Đã thêm ${samplePosts.length} posts`)
    return { success: true, count: samplePosts.length }
  } catch (error) {
    console.error('❌ Lỗi khi thêm posts:', error)
    return { success: false, error }
  }
}

// Function to seed customers data
export const seedCustomersData = async () => {
  try {
    console.log('🌱 Bắt đầu thêm dữ liệu khách hàng...')
    
    for (let i = 0; i < sampleCustomers.length; i++) {
      const customer = sampleCustomers[i]
      await addDoc(collection(db, 'users'), {
        ...customer,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      })
      console.log(`✅ Đã thêm khách hàng: ${customer.displayName}`)
    }
    
    console.log(`🎉 Hoàn thành! Đã thêm ${sampleCustomers.length} khách hàng`)
    return { success: true, count: sampleCustomers.length }
  } catch (error) {
    console.error('❌ Lỗi khi thêm khách hàng:', error)
    return { success: false, error }
  }
}

// Function to seed staff data
export const seedStaffData = async () => {
  try {
    console.log('🌱 Bắt đầu thêm dữ liệu nhân viên...')
    
    for (let i = 0; i < sampleStaff.length; i++) {
      const staff = sampleStaff[i]
      await addDoc(collection(db, 'admins'), {
        ...staff,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log(`✅ Đã thêm nhân viên: ${staff.displayName}`)
    }
    
    console.log(`🎉 Hoàn thành! Đã thêm ${sampleStaff.length} nhân viên`)
    return { success: true, count: sampleStaff.length }
  } catch (error) {
    console.error('❌ Lỗi khi thêm nhân viên:', error)
    return { success: false, error }
  }
}

// Function to seed affiliates data
export const seedAffiliatesData = async () => {
  try {
    console.log('🌱 Bắt đầu thêm dữ liệu affiliate...')
    
    for (let i = 0; i < sampleAffiliates.length; i++) {
      const affiliate = sampleAffiliates[i]
      await addDoc(collection(db, 'affiliates'), {
        ...affiliate,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log(`✅ Đã thêm affiliate: ${affiliate.name}`)
    }
    
    console.log(`🎉 Hoàn thành! Đã thêm ${sampleAffiliates.length} affiliate`)
    return { success: true, count: sampleAffiliates.length }
  } catch (error) {
    console.error('❌ Lỗi khi thêm affiliate:', error)
    return { success: false, error }
  }
}

// Function to seed bookings data
export const seedBookingsData = async () => {
  try {
    console.log('🌱 Bắt đầu thêm dữ liệu đặt tour...')
    
    for (let i = 0; i < sampleBookings.length; i++) {
      const booking = sampleBookings[i]
      await addDoc(collection(db, 'bookings'), {
        ...booking,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log(`✅ Đã thêm đặt tour: ${booking.tourName}`)
    }
    
    console.log(`🎉 Hoàn thành! Đã thêm ${sampleBookings.length} đặt tour`)
    return { success: true, count: sampleBookings.length }
  } catch (error) {
    console.error('❌ Lỗi khi thêm đặt tour:', error)
    return { success: false, error }
  }
}

// Function to seed all data
export const seedAllData = async () => {
  try {
    console.log('🚀 Bắt đầu thêm tất cả dữ liệu...')
    
    const toursResult = await seedToursData()
    const postsResult = await seedPostsData()
    const customersResult = await seedCustomersData()
    const staffResult = await seedStaffData()
    const affiliatesResult = await seedAffiliatesData()
    const bookingsResult = await seedBookingsData()
    
    if (toursResult.success && postsResult.success && customersResult.success && 
        staffResult.success && affiliatesResult.success && bookingsResult.success) {
      console.log(`🎉 Hoàn thành tất cả! Đã thêm ${toursResult.count} tours, ${postsResult.count} posts, ${customersResult.count} khách hàng, ${staffResult.count} nhân viên, ${affiliatesResult.count} affiliate, ${bookingsResult.count} đặt tour`)
      return { 
        success: true, 
        tours: toursResult.count, 
        posts: postsResult.count,
        customers: customersResult.count,
        staff: staffResult.count,
        affiliates: affiliatesResult.count,
        bookings: bookingsResult.count
      }
    } else {
      throw new Error('Có lỗi xảy ra khi thêm dữ liệu')
    }
  } catch (error) {
    console.error('❌ Lỗi khi thêm dữ liệu:', error)
    return { success: false, error }
  }
}
