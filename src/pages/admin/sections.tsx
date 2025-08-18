import { CrudTable } from './components/CrudTable'
import type { CrudColumn } from './components/CrudTable'

export function CustomersPage(){
  const cols: CrudColumn[] = [
    { key:'name', label:'Tên', type:'string', required:true },
    { key:'email', label:'Email', type:'string', required:true },
    { key:'phone', label:'Điện thoại', type:'string' },
    { key:'vip', label:'VIP', type:'boolean' },
  ]
  return <CrudTable title="Quản lý khách hàng" collectionName="customers" columns={cols} />
}
export function StaffPage(){
  const cols: CrudColumn[] = [
    { key:'name', label:'Tên', type:'string', required:true },
    { key:'email', label:'Email', type:'string', required:true },
    { key:'role', label:'Vai trò', type:'string' },
    { key:'active', label:'Kích hoạt', type:'boolean' },
  ]
  return <CrudTable title="Quản lý nhân viên" collectionName="staff" columns={cols} />
}
export function ToursAdminPage(){
  const cols: CrudColumn[] = [
    { key:'title', label:'Tên tour', type:'string', required:true },
    { key:'location', label:'Địa điểm', type:'string', required:true },
    { key:'price', label:'Giá', type:'number', required:true },
    { key:'rating', label:'Đánh giá (1-10)', type:'number' },
    { key:'hot', label:'HOT', type:'boolean' },
    { key:'imageUrl', label:'Ảnh', type:'string' },
    { key:'desc', label:'Mô tả', type:'text' },
  ]
  return <CrudTable title="Quản lý tour" collectionName="admin_tours" columns={cols} />
}
export function PostsPage(){
  const cols: CrudColumn[] = [
    { key:'title', label:'Tiêu đề', type:'string', required:true },
    { key:'slug', label:'Slug', type:'string', required:true },
    { key:'content', label:'Nội dung', type:'text', required:true },
    { key:'published', label:'Xuất bản', type:'boolean' },
  ]
  return <CrudTable title="Quản lý bài viết" collectionName="posts" columns={cols} />
}
export function ThemePage(){
  const cols: CrudColumn[] = [
    { key:'primary', label:'Primary', type:'string' },
    { key:'secondary', label:'Secondary', type:'string' },
    { key:'darkMode', label:'Dark mode', type:'boolean' },
  ]
  return <CrudTable title="Quản lý theme" collectionName="themes" columns={cols} />
}
export function AboutAdminPage(){
  const cols: CrudColumn[] = [
    { key:'headline', label:'Tiêu đề', type:'string', required:true },
    { key:'content', label:'Nội dung', type:'text', required:true },
  ]
  return <CrudTable title="Quản lý giới thiệu" collectionName="about" columns={cols} />
}
export function BookingsAdminPage(){
  const cols: CrudColumn[] = [
    { key:'userId', label:'Khách', type:'string', required:true },
    { key:'tourId', label:'Tour', type:'string', required:true },
    { key:'status', label:'Trạng thái', type:'string' },
    { key:'paid', label:'Đã thanh toán', type:'boolean' },
  ]
  return <CrudTable title="Danh sách đặt tour" collectionName="bookings" columns={cols} />
}


