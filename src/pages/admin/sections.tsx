import { CrudTable } from './components/CrudTable'
import type { CrudColumn } from './components/CrudTable'

export function CustomersPage(){
  const cols: CrudColumn[] = [
    { key:'displayName', label:'Tên', type:'string', required:true },
    { key:'email', label:'Email', type:'string', required:true },
    { key:'phoneNumber', label:'Điện thoại', type:'string' },
    { key:'role', label:'Vai trò', type:'string' },
    { key:'createdAt', label:'Ngày tạo', type:'date' },
  ]
  return <CrudTable title="Quản lý khách hàng" collectionName="users" columns={cols} />
}

export function StaffPage(){
  const cols: CrudColumn[] = [
    { key:'displayName', label:'Tên', type:'string', required:true },
    { key:'email', label:'Email', type:'string', required:true },
    { key:'role', label:'Vai trò', type:'string' },
    { key:'uid', label:'User ID', type:'string' },
    { key:'createdAt', label:'Ngày tạo', type:'date' },
  ]
  return <CrudTable title="Quản lý nhân viên" collectionName="admins" columns={cols} />
}

export function ToursAdminPage(){
  const cols: CrudColumn[] = [
    { key:'name', label:'Tên tour', type:'string', required:true },
    { key:'location', label:'Địa điểm', type:'string', required:true },
    { key:'price', label:'Giá', type:'number', required:true },
    { key:'rating', label:'Đánh giá', type:'number' },
    { key:'category', label:'Danh mục', type:'string' },
    { key:'duration', label:'Thời gian', type:'string' },
    { key:'featured', label:'Nổi bật', type:'boolean' },
    { key:'status', label:'Trạng thái', type:'string' },
    { key:'imageUrl', label:'Ảnh', type:'string' },
  ]
  return <CrudTable title="Quản lý tour" collectionName="TOURS" columns={cols} />
}

export function PostsPage(){
  const cols: CrudColumn[] = [
    { key:'title', label:'Tiêu đề', type:'string', required:true },
    { key:'author', label:'Tác giả', type:'string', required:true },
    { key:'category', label:'Danh mục', type:'string' },
    { key:'tags', label:'Tags', type:'array' },
    { key:'readTime', label:'Thời gian đọc', type:'string' },
    { key:'views', label:'Lượt xem', type:'number' },
    { key:'likes', label:'Lượt thích', type:'number' },
    { key:'status', label:'Trạng thái', type:'string' },
    { key:'featured', label:'Nổi bật', type:'boolean' },
    { key:'publishedAt', label:'Ngày xuất bản', type:'date' },
  ]
  return <CrudTable title="Quản lý bài viết" collectionName="POSTS" columns={cols} />
}

export function ThemePage(){
  const cols: CrudColumn[] = [
    { key:'name', label:'Tên theme', type:'string', required:true },
    { key:'primaryColor', label:'Màu chính', type:'string' },
    { key:'secondaryColor', label:'Màu phụ', type:'string' },
    { key:'darkMode', label:'Dark mode', type:'boolean' },
    { key:'active', label:'Kích hoạt', type:'boolean' },
  ]
  return <CrudTable title="Quản lý theme" collectionName="themes" columns={cols} />
}

export function AboutAdminPage(){
  const cols: CrudColumn[] = [
    { key:'title', label:'Tiêu đề', type:'string', required:true },
    { key:'content', label:'Nội dung', type:'text', required:true },
    { key:'section', label:'Phần', type:'string' },
    { key:'order', label:'Thứ tự', type:'number' },
    { key:'active', label:'Kích hoạt', type:'boolean' },
  ]
  return <CrudTable title="Quản lý giới thiệu" collectionName="about" columns={cols} />
}

export function BookingsAdminPage(){
  const cols: CrudColumn[] = [
    { key:'tourName', label:'Tên tour', type:'string', required:true },
    { key:'customerName', label:'Tên khách', type:'string', required:true },
    { key:'customerEmail', label:'Email khách', type:'string' },
    { key:'customerPhone', label:'Điện thoại', type:'string' },
    { key:'status', label:'Trạng thái', type:'string' },
    { key:'paid', label:'Đã thanh toán', type:'boolean' },
    { key:'amount', label:'Số tiền', type:'number' },
    { key:'affiliateName', label:'Đối tác', type:'string' },
    { key:'bookingDate', label:'Ngày đặt', type:'date' },
    { key:'travelDate', label:'Ngày đi', type:'date' },
  ]
  return <CrudTable title="Danh sách đặt tour" collectionName="bookings" columns={cols} />
}

export function AffiliatePage(){
  const cols: CrudColumn[] = [
    { key:'name', label:'Tên đối tác', type:'string', required:true },
    { key:'email', label:'Email', type:'string', required:true },
    { key:'phone', label:'Điện thoại', type:'string' },
    { key:'website', label:'Website', type:'string' },
    { key:'commission', label:'Hoa hồng (%)', type:'number' },
    { key:'totalEarnings', label:'Tổng thu nhập', type:'number' },
    { key:'paidAmount', label:'Đã thanh toán', type:'number' },
    { key:'pendingAmount', label:'Chờ thanh toán', type:'number' },
    { key:'status', label:'Trạng thái', type:'string' },
    { key:'active', label:'Kích hoạt', type:'boolean' },
    { key:'createdAt', label:'Ngày tạo', type:'date' },
  ]
  return <CrudTable title="Quản lý đối tác affiliate" collectionName="affiliates" columns={cols} />
}

export { AffiliateReportPage } from './AffiliateReportPage'


