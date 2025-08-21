import { CrudTable } from './components/CrudTable'
import type { CrudColumn } from './components/CrudTable'

export function CustomersPage(){
  const cols: CrudColumn[] = [
    { key:'displayName', label:'Tên', type:'string', required:true, tooltip:'Tên đầy đủ của khách hàng' },
    { key:'email', label:'Email', type:'string', required:true, tooltip:'Email liên hệ chính của khách hàng' },
    { key:'phoneNumber', label:'Điện thoại', type:'string', tooltip:'Số điện thoại liên hệ (chỉ nhập số và ký tự +, -, (, ), khoảng trắng)' },
    { key:'role', label:'Vai trò', type:'string', tooltip:'Vai trò của khách hàng trong hệ thống (ví dụ: Khách hàng, Đối tác, Nhân viên)' },
    { key:'createdAt', label:'Ngày tạo', type:'date' , hideInForm: true },
  ]
  return <CrudTable title="Quản lý khách hàng" collectionName="users" columns={cols} />
}

export function StaffAdminPage(){
  const cols: CrudColumn[] = [
    { 
      key:'name', 
      label:'Tên nhân viên', 
      type:'string', 
      required:true,
      tooltip: 'Họ và tên đầy đủ của nhân viên'
    },
    { 
      key:'email', 
      label:'Email', 
      type:'string', 
      required:true,
      tooltip: 'Email liên hệ chính của nhân viên'
    },
    { 
      key:'phone', 
      label:'Điện thoại', 
      type:'string',
      tooltip: 'Số điện thoại liên hệ (chỉ nhập số và ký tự +, -, (, ), khoảng trắng)'
    },
    { 
      key:'role', 
      label:'Vai trò', 
      type:'select',
      options: [
        { value: 'admin', label: 'Quản trị viên' },
        { value: 'manager', label: 'Quản lý' },
        { value: 'staff', label: 'Nhân viên' },
        { value: 'guide', label: 'Hướng dẫn viên' },
        { value: 'support', label: 'Hỗ trợ khách hàng' }
      ],
      tooltip: 'Vai trò và quyền hạn của nhân viên trong hệ thống'
    },
    { 
      key:'uid', 
      label:'User ID', 
      type:'string',
      tooltip: 'ID người dùng từ Firebase Authentication (tự động tạo)',
      hideInTable: true
    },
    { 
      key:'department', 
      label:'Phòng ban', 
      type:'select',
      options: [
        { value: 'sales', label: 'Kinh doanh' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'operations', label: 'Vận hành' },
        { value: 'customer_service', label: 'Chăm sóc khách hàng' },
        { value: 'finance', label: 'Tài chính' },
        { value: 'hr', label: 'Nhân sự' }
      ],
      tooltip: 'Phòng ban nơi nhân viên làm việc',
      hideInTable: true
    },
    { 
      key:'position', 
      label:'Chức vụ', 
      type:'string',
      tooltip: 'Chức vụ cụ thể của nhân viên trong phòng ban'
    },
    { 
      key:'hireDate', 
      label:'Ngày vào làm', 
      type:'date',
      tooltip: 'Ngày nhân viên bắt đầu làm việc tại công ty'
    },
    { 
      key:'salary', 
      label:'Lương cơ bản', 
      type:'number',
      tooltip: 'Mức lương cơ bản của nhân viên'
    },
    { 
      key:'active', 
      label:'Đang làm việc', 
      type:'boolean',
      tooltip: 'Đánh dấu nếu nhân viên đang làm việc tại công ty'
    },
    { 
      key:'address', 
      label:'Địa chỉ', 
      type:'text',
      tooltip: 'Địa chỉ nhà của nhân viên',
      hideInTable: true
    },
    { 
      key:'emergencyContact', 
      label:'Liên hệ khẩn cấp', 
      type:'string',
      tooltip: 'Tên và số điện thoại người liên hệ khẩn cấp',
      hideInTable: true
    },
    { 
      key:'skills', 
      label:'Kỹ năng', 
      type:'array',
      tooltip: 'Các kỹ năng chuyên môn của nhân viên (phân cách bằng dấu phẩy)'
    },
    { 
      key:'notes', 
      label:'Ghi chú', 
      type:'text',
      tooltip: 'Ghi chú nội bộ về nhân viên',
      hideInTable: true
    }
  ]
  return <CrudTable title="Quản lý nhân viên" collectionName="admins" columns={cols} />
}

export function ToursAdminPage(){
  const cols: CrudColumn[] = [
    { 
      key:'name', 
      label:'Tên tour', 
      type:'string', 
      required:true,
      tooltip: 'Tên đầy đủ của tour du lịch'
    },
    { 
      key:'location', 
      label:'Địa điểm', 
      type:'string', 
      required:true,
      tooltip: 'Địa điểm du lịch (tỉnh/thành phố, quốc gia)'
    },
    { 
      key:'price', 
      label:'Giá (VNĐ)', 
      type:'number', 
      required:true,
      tooltip: 'Giá tour tính theo VNĐ (chỉ nhập số)'
    },
    { 
      key:'rating', 
      label:'Đánh giá (tự tính)', 
      type:'number',
      tooltip: 'Được tính từ đánh giá khách, không nhập thủ công',
      hideInForm: true
    },
    { 
      key:'category', 
      label:'Danh mục', 
      type:'select',
      options: [
        { value: 'Biển', label: 'Biển' },
        { value: 'Núi', label: 'Núi' },
        { value: 'Thành phố', label: 'Thành phố' },
        { value: 'Nông thôn', label: 'Nông thôn' },
        { value: 'Văn hóa', label: 'Văn hóa' },
        { value: 'Ẩm thực', label: 'Ẩm thực' },
        { value: 'Khám phá', label: 'Khám phá' }
      ],
      tooltip: 'Chọn danh mục phù hợp với loại hình tour'
    },
    { 
      key:'duration', 
      label:'Thời gian', 
      type:'string',
      tooltip: 'Thời gian tour (ví dụ: 3 ngày 2 đêm)'
    },
    { 
      key:'featured', 
      label:'Nổi bật', 
      type:'boolean',
      tooltip: 'Đánh dấu nếu tour nổi bật cần quảng bá'
    },
    // Status ẩn trong form, mặc định chờ xác nhận (ở onSubmit xử lý)
    { key:'status', label:'Trạng thái', type:'string', hideInForm: true },
    {
      key:'approved',
      label:'Đã kiểm duyệt',
      type:'boolean',
      tooltip:'Chỉ admin/manager được duyệt. Tour mới tạo mặc định chờ duyệt',
      hideInForm: true
    },
    {
      key:'approvedBy',
      label:'Người duyệt',
      type:'string',
      tooltip:'Tự động lưu khi duyệt',
      hideInForm: true
    },
    {
      key:'approvedAt',
      label:'Ngày duyệt',
      type:'date',
      tooltip:'Tự động lưu khi duyệt',
      hideInForm: true
    },
    { 
      key:'imageUrl', 
      label:'Ảnh', 
      type:'string',
      tooltip: 'URL ảnh đại diện cho tour (hỗ trợ jpg, png, gif)'
    },
    {
      key:'images',
      label:'Thư viện ảnh',
      type:'array',
      tooltip:'Danh sách ảnh bổ sung (jpg, png, jpeg)'
    },
    { 
      key:'description', 
      label:'Mô tả', 
      type:'text',
      tooltip: 'Mô tả chi tiết về tour du lịch',
      hideInTable: true
    },
    {
      key:'insuranceIncluded',
      label:'Bao gồm bảo hiểm',
      type:'boolean',
      tooltip:'Đánh dấu nếu tour bao gồm bảo hiểm du lịch'
    },
    {
      key:'insuranceDetails',
      label:'Chi tiết bảo hiểm',
      type:'text',
      tooltip:'Mô tả quyền lợi bảo hiểm, phạm vi, điều kiện',
      hideInTable: true
    },
    { 
      key:'highlights', 
      label:'Điểm nổi bật', 
      type:'text',
      tooltip: 'Các điểm nổi bật của tour'
    },
    { 
      key:'included', 
      label:'Bao gồm', 
      type:'text',
      tooltip: 'Dịch vụ bao gồm trong tour',
      hideInTable: true
    },
    { 
      key:'excluded', 
      label:'Không bao gồm', 
      type:'text',
      tooltip: 'Dịch vụ không bao gồm trong tour',
      hideInTable: true
    },
    { 
      key:'maxGroupSize', 
      label:'Số người tối đa', 
      type:'number',
      tooltip: 'Số người tối đa cho mỗi nhóm tour (chỉ nhập số)'
    },
    { 
      key:'bestTime', 
      label:'Thời gian tốt nhất', 
      type:'string',
      tooltip: 'Thời gian trong năm phù hợp nhất để đi tour',
      hideInTable: true
    }
  ]
  return <CrudTable title="Quản lý tour" collectionName="TOURS" columns={cols} />
}

export function PostsPage(){
  const cols: CrudColumn[] = [
    { 
      key:'title', 
      label:'Tiêu đề', 
      type:'string', 
      required:true,
      tooltip: 'Tiêu đề chính của bài viết'
    },
    { 
      key:'author', 
      label:'Tác giả', 
      type:'string', 
      required:true,
      tooltip: 'Tên tác giả viết bài'
    },
    { 
      key:'category', 
      label:'Danh mục', 
      type:'select',
      options: [
        { value: 'Du lịch', label: 'Du lịch' },
        { value: 'Ẩm thực', label: 'Ẩm thực' },
        { value: 'Văn hóa', label: 'Văn hóa' },
        { value: 'Khám phá', label: 'Khám phá' },
        { value: 'Kinh nghiệm', label: 'Kinh nghiệm' },
        { value: 'Tin tức', label: 'Tin tức' }
      ],
      tooltip: 'Chọn danh mục phù hợp với nội dung bài viết'
    },
    { 
      key:'tags', 
      label:'Tags', 
      type:'array',
      tooltip: 'Các từ khóa liên quan đến bài viết (phân cách bằng dấu phẩy)'
    },
    { 
      key:'readTime', 
      label:'Thời gian đọc', 
      type:'string',
      tooltip: 'Thời gian ước tính để đọc hết bài viết (ví dụ: 5 phút)',
      hideInTable: true, hideInForm: true
    },
    { 
      key:'featured', 
      label:'Nổi bật', 
      type:'boolean',
      tooltip: 'Đánh dấu nếu bài viết nổi bật cần hiển thị ở vị trí đặc biệt'
    },
    { 
      key:'publishedAt', 
      label:'Ngày xuất bản', 
      type:'date',
      tooltip: 'Ngày bài viết được xuất bản công khai'
    },
    { 
      key:'excerpt', 
      label:'Tóm tắt', 
      type:'text',
      tooltip: 'Đoạn tóm tắt ngắn gọn nội dung bài viết',
      hideInForm: false,
      hideInTable: true
    },
    { 
      key:'content', 
      label:'Nội dung', 
      type:'text',
      tooltip: 'Nội dung chính của bài viết (có thể sử dụng HTML)',
      hideInForm: false,
      hideInTable: true
    },
    { 
      key:'imageUrl', 
      label:'Ảnh đại diện', 
      type:'string',
      tooltip: 'URL ảnh đại diện cho bài viết (hỗ trợ jpg, png)'
    },
    { 
      key:'seoTitle', 
      label:'SEO Title', 
      type:'string',
      tooltip: 'Tiêu đề tối ưu cho SEO',
      hideInTable: true
    },
    { 
      key:'seoDescription', 
      label:'SEO Description', 
      type:'text',
      tooltip: 'Mô tả tối ưu cho SEO',
      hideInTable: true
    }
  ]
  return <CrudTable title="Quản lý bài viết" collectionName="POSTS" columns={cols} />
}

export function ThemePage(){
  const cols: CrudColumn[] = [
    { key:'name', label:'Tên theme', type:'string', required:true },
    { key:'primaryColor', label:'Màu chính', type:'color', tooltip:'Màu chính của theme (VD: #ff5733)' },
    { key:'secondaryColor', label:'Màu phụ', type:'color', tooltip:'Màu phụ của theme (VD: #33c1ff)' },
    { key:'darkMode', label:'Dark mode', type:'boolean', tooltip:'Cho phép chế độ tối cho theme' },
    { key:'active', label:'Kích hoạt', type:'boolean', tooltip:'Đánh dấu nếu theme đang được sử dụng' },
  ]
  return <CrudTable title="Quản lý theme" collectionName="themes" columns={cols} />
}

export function SettingsPage(){
  const cols: CrudColumn[] = [
    { key:'siteName', label:'Tên website', type:'string', required:true, tooltip:'Tên hiển thị của website (VD: Tour Việt Nam)' },
    { key:'logoUrl', label:'Logo URL', type:'string', tooltip:'URL ảnh logo hiển thị trên website (hỗ trợ jpg, png)' },
    { key:'primaryPhone', label:'Điện thoại', type:'string', tooltip:'Số điện thoại chính để liên hệ (chỉ nhập số và ký tự +, -, (, ), khoảng trắng)' },
    { key:'supportEmail', label:'Email hỗ trợ', type:'string', tooltip:'Email hỗ trợ khách hàng (VD:)' },
    { key:'address', label:'Địa chỉ', type:'text', tooltip:'Địa chỉ văn phòng công ty' },
    { key:'facebook', label:'Facebook', type:'string', tooltip:'URL trang Facebook chính thức của công ty' },
    { key:'zalo', label:'Zalo', type:'string', tooltip:'Số điện thoại Zalo để liên hệ' },
    { key:'hotline', label:'Hotline', type:'string', tooltip:'Số điện thoại hotline hỗ trợ khách hàng (chỉ nhập số và ký tự +, -, (, ), khoảng trắng)' },
  ]
  return <CrudTable title="Cấu hình hệ thống" collectionName="settings" columns={cols} createDefaults={{ id:'global' }} />
}

export function BanksAdminPage(){
  const cols: CrudColumn[] = [
    { key:'name', label:'Ngân hàng', type:'string', required:true, tooltip:'Tên ngân hàng (VD: Vietcombank, MB Bank, Techcombank, ...)' },
    { key:'accountNumber', label:'Số tài khoản', type:'string', required:true, tooltip:'Số tài khoản ngân hàng để chuyển tiền' },
    { key:'accountName', label:'Chủ tài khoản', type:'string', required:true, tooltip:'Tên chủ tài khoản ngân hàng (có thể là tên công ty)' },
    { key:'qrImageUrl', label:'QR Code', type:'string', tooltip:'URL ảnh QR chuyển khoản' },
  ]
  return <CrudTable title="Tài khoản ngân hàng" collectionName="banks" columns={cols} />
}

export function AboutAdminPage(){
  const cols: CrudColumn[] = [
    { key:'title', label:'Tiêu đề', type:'string', required:true, tooltip:'Tiêu đề phần giới thiệu (VD: Giới thiệu, Chính sách, Điều khoản)' },
    { key:'content', label:'Nội dung', type:'text', required:true, tooltip:'Nội dung chi tiết phần giới thiệu (có thể sử dụng HTML)' },
    { key:'section', label:'Phần', type:'string',hideInForm:true, tooltip:'Phần nội dung (VD: Giới thiệu, Chính sách, Điều khoản)', hideInTable:true },
    { key:'order', label:'Thứ tự', type:'number',hideInTable:true, tooltip:'Thứ tự hiển thị trong phần này (số nhỏ hiển thị trước)' },
    { key:'active', label:'Kích hoạt', type:'boolean',hideInTable:true  },
  ]
  return <CrudTable title="Quản lý giới thiệu" collectionName="about" columns={cols} />
}

export function BookingsAdminPage(){
  const cols: CrudColumn[] = [
    { 
      key:'tourId', 
      label:'Tour', 
      type:'select', 
      required:true,
      collection: 'TOURS',
      displayField: 'name',
      valueField: 'id',
      tooltip: 'Chọn tour từ danh sách có sẵn'
    },
    {
      key:'tourName',
      label:'Tên tour',
      type:'string',
      tooltip:'Tên tour tại thời điểm đặt (tự động điền khi tạo)'
    },
    { 
      key:'customerName', 
      label:'Tên khách hàng', 
      type:'string', 
      required:true,
      tooltip: 'Nhập tên khách hàng mới hoặc chọn từ danh sách khách hàng có sẵn'
    },
    { 
      key:'customerEmail', 
      label:'Email khách', 
      type:'string',
      tooltip: 'Email liên hệ của khách hàng'
    },
    { 
      key:'customerPhone', 
      label:'Điện thoại', 
      type:'string',
      tooltip: 'Số điện thoại liên hệ (chỉ nhập số và ký tự +, -, (, ), khoảng trắng)'
    },
    { 
      key:'status', 
      label:'Trạng thái', 
      type:'select',
      required: true,
      options: [
        { value: 'pending', label: 'Chờ xác nhận' },
        { value: 'confirmed', label: 'Đã xác nhận' },
        { value: 'cancelled', label: 'Đã hủy' },
        { value: 'completed', label: 'Hoàn thành' }
      ],
      tooltip: 'Trạng thái đặt tour: Chờ xác nhận, Đã xác nhận, Đã hủy, Hoàn thành'
    },
    {
      key:'paymentMethod',
      label:'Hình thức nhận tiền',
      type:'select',
      options: [
        { value: 'cash', label: 'Tiền mặt' },
        { value: 'bank_transfer', label: 'Chuyển khoản' }
      ],
      tooltip:'Chọn hình thức nhận tiền khi duyệt/ghi nhận',
    },
    {
      key:'bankId',
      label:'Ngân hàng',
      type:'select',
      collection: 'banks',
      displayField: 'name',
      valueField: 'id',
      tooltip:'Chọn ngân hàng đã nhận tiền'
    },
    { 
      key:'paid', 
      label:'Đã thanh toán', 
      type:'boolean',
      tooltip: 'Đánh dấu nếu khách hàng đã thanh toán'
    },
    { 
      key:'amount', 
      label:'Số tiền (VNĐ)', 
      type:'number',
      required: true,
      tooltip: 'Tổng số tiền tour (chỉ nhập số)'
    },
    { 
      key:'affiliateId', 
      label:'Đối tác affiliate', 
      type:'select',
      collection: 'affiliates',
      displayField: 'name',
      valueField: 'id',
      tooltip: 'Chọn đối tác affiliate nếu có'
    },
    { 
      key:'bookingDate', 
      label:'Ngày đặt', 
      type:'date',
      required: true,
      tooltip: 'Ngày khách hàng đặt tour'
    },
    { 
      key:'travelDate', 
      label:'Ngày đi', 
      type:'date',
      required: true,
      tooltip: 'Ngày khởi hành tour'
    },
    { 
      key:'numberOfPeople', 
      label:'Số người', 
      type:'number',
      required: true,
      tooltip: 'Số người tham gia tour (chỉ nhập số)'
    },
    { 
      key:'specialRequests', 
      label:'Yêu cầu đặc biệt', 
      type:'text',
      tooltip: 'Ghi chú yêu cầu đặc biệt của khách hàng'
    },
    { 
      key:'paymentMethod', 
      label:'Phương thức thanh toán', 
      type:'select',
      options: [
        { value: 'cash', label: 'Tiền mặt' },
        { value: 'bank_transfer', label: 'Chuyển khoản' }
      ],
      tooltip: 'Phương thức thanh toán khách hàng sử dụng'
    },
    {
      key:'bankName',
      label:'Tên ngân hàng',
      type:'string',
      tooltip:'Tự động lưu theo lựa chọn của khách, có thể chỉnh khi duyệt',
      hideInForm: true
    },
    { 
      key:'notes', 
      label:'Ghi chú', 
      type:'text',
      tooltip: 'Ghi chú nội bộ về đặt tour'
    }
  ]
  return <CrudTable title="Danh sách đặt tour" collectionName="bookings" columns={cols} />
}

export function AffiliatePage(){
  const cols: CrudColumn[] = [
    { 
      key:'name', 
      label:'Tên đối tác', 
      type:'string', 
      required:true,
      tooltip: 'Tên đầy đủ của công ty/đối tác affiliate'
    },
    { 
      key:'email', 
      label:'Email', 
      type:'string', 
      required:true,
      tooltip: 'Email liên hệ chính của đối tác'
    },
    { 
      key:'phone', 
      label:'Điện thoại', 
      type:'string',
      tooltip: 'Số điện thoại liên hệ (chỉ nhập số và ký tự +, -, (, ), khoảng trắng)'
    },
    { 
      key:'website', 
      label:'Website', 
      type:'string',
      tooltip: 'Website chính thức của đối tác affiliate'
    },
    { 
      key:'commission', 
      label:'Hoa hồng (%)', 
      type:'number',
      tooltip: 'Tỷ lệ hoa hồng tính theo phần trăm (chỉ nhập số từ 0-100)'
    },
    { 
      key:'totalEarnings', 
      label:'Tổng thu nhập', 
      type:'number',
      tooltip: 'Tổng số tiền đối tác đã kiếm được (tự động tính)',
      hideInForm: true
    },
    { 
      key:'paidAmount', 
      label:'Đã thanh toán', 
      type:'number',
      tooltip: 'Số tiền đã thanh toán cho đối tác (tự động tính)',
      hideInForm: true
    },
    { 
      key:'pendingAmount', 
      label:'Chờ thanh toán', 
      type:'number',
      tooltip: 'Số tiền còn nợ đối tác (tự động tính)',
      hideInForm: true
    },
    { 
      key:'status', 
      label:'Trạng thái', 
      type:'select',
      options: [
        { value: 'active', label: 'Hoạt động' },
        { value: 'inactive', label: 'Tạm dừng' },
        { value: 'suspended', label: 'Tạm khóa' }
      ],
      tooltip: 'Trạng thái hoạt động của đối tác affiliate'
    },
    { 
      key:'active', 
      label:'Kích hoạt', 
      type:'boolean',
      tooltip: 'Đánh dấu nếu đối tác đang hoạt động và có thể nhận hoa hồng'
    },
    { 
      key:'address', 
      label:'Địa chỉ', 
      type:'text',
      tooltip: 'Địa chỉ văn phòng của đối tác affiliate'
    },
    { 
      key:'contactPerson', 
      label:'Người liên hệ', 
      type:'string',
      tooltip: 'Tên người đại diện liên hệ chính'
    },
    { 
      key:'bankInfo', 
      label:'Thông tin ngân hàng', 
      type:'text',
      tooltip: 'Thông tin tài khoản ngân hàng để thanh toán hoa hồng'
    },
    { 
      key:'contractStart', 
      label:'Ngày bắt đầu hợp đồng', 
      type:'date',
      tooltip: 'Ngày bắt đầu hợp tác affiliate'
    },
    { 
      key:'contractEnd', 
      label:'Ngày kết thúc hợp đồng', 
      type:'date',
      tooltip: 'Ngày kết thúc hợp tác affiliate (nếu có)'
    }
  ]
  return <CrudTable title="Quản lý đối tác affiliate" collectionName="affiliates" columns={cols} />
}

export { AffiliateReportPage } from './AffiliateReportPage'
export { AffiliatePaymentPage } from './AffiliatePaymentPage'
export { RevenueReportPage } from './RevenueReportPage'
export { TourPerformancePage } from './TourPerformancePage'

export function CustomersAdminPage(){
  const cols: CrudColumn[] = [
    { 
      key:'name', 
      label:'Tên khách hàng', 
      type:'string', 
      required:true,
      tooltip: 'Họ và tên đầy đủ của khách hàng'
    },
    { 
      key:'email', 
      label:'Email', 
      type:'string', 
      required:true,
      tooltip: 'Email liên hệ chính của khách hàng'
    },
    { 
      key:'phone', 
      label:'Điện thoại', 
      type:'string',
      tooltip: 'Số điện thoại liên hệ (chỉ nhập số và ký tự +, -, (, ), khoảng trắng)'
    },
    { 
      key:'vip', 
      label:'Khách VIP', 
      type:'boolean',
      tooltip: 'Đánh dấu nếu khách hàng là VIP'
    },
    { 
      key:'address', 
      label:'Địa chỉ', 
      type:'text',
      tooltip: 'Địa chỉ nhà của khách hàng'
    },
    { 
      key:'city', 
      label:'Thành phố', 
      type:'string',
      tooltip: 'Thành phố nơi khách hàng sinh sống'
    },
    { 
      key:'country', 
      label:'Quốc gia', 
      type:'string',
      tooltip: 'Quốc gia nơi khách hàng sinh sống'
    },
    { 
      key:'birthDate', 
      label:'Ngày sinh', 
      type:'date',
      tooltip: 'Ngày sinh của khách hàng'
    },
    { 
      key:'gender', 
      label:'Giới tính', 
      type:'select',
      options: [
        { value: 'male', label: 'Nam' },
        { value: 'female', label: 'Nữ' },
        { value: 'other', label: 'Khác' }
      ],
      tooltip: 'Giới tính của khách hàng'
    },
    { 
      key:'occupation', 
      label:'Nghề nghiệp', 
      type:'string',
      tooltip: 'Nghề nghiệp hiện tại của khách hàng'
    },
    { 
      key:'interests', 
      label:'Sở thích', 
      type:'array',
      tooltip: 'Các sở thích du lịch của khách hàng (phân cách bằng dấu phẩy)'
    },
    { 
      key:'preferredDestinations', 
      label:'Điểm đến yêu thích', 
      type:'array',
      tooltip: 'Các điểm đến du lịch yêu thích (phân cách bằng dấu phẩy)'
    },
    { 
      key:'budgetRange', 
      label:'Khoảng ngân sách', 
      type:'select',
      options: [
        { value: 'low', label: 'Thấp (< 5 triệu)' },
        { value: 'medium', label: 'Trung bình (5-15 triệu)' },
        { value: 'high', label: 'Cao (> 15 triệu)' }
      ],
      tooltip: 'Khoảng ngân sách khách hàng thường chi cho du lịch'
    },
    { 
      key:'travelFrequency', 
      label:'Tần suất du lịch', 
      type:'select',
      options: [
        { value: 'rarely', label: 'Hiếm khi' },
        { value: 'occasionally', label: 'Thỉnh thoảng' },
        { value: 'frequently', label: 'Thường xuyên' },
        { value: 'very_frequently', label: 'Rất thường xuyên' }
      ],
      tooltip: 'Tần suất khách hàng đi du lịch'
    },
    { 
      key:'notes', 
      label:'Ghi chú', 
      type:'text',
      tooltip: 'Ghi chú nội bộ về khách hàng'
    },
    { 
      key:'createdAt', 
      label:'Ngày tạo', 
      type:'date',
      tooltip: 'Ngày khách hàng được thêm vào hệ thống'
    }
  ]
  return <CrudTable title="Quản lý khách hàng" collectionName="customers" columns={cols} />
}


