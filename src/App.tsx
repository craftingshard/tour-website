import { Routes, Route } from 'react-router-dom'
import './App.css'
import { AppProviders } from './context/AppProviders'
import { AdminProviders } from './context/AdminProviders'
import { Header } from './components/Header'
import { HomePage } from './pages/HomePage'
import { ToursPage } from './pages/ToursPage'
import { TourDetailPage } from './pages/TourDetailPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { GuidePage } from './pages/GuidePage'
import { PostDetailPage } from './pages/PostDetailPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ProfilePage } from './pages/ProfilePage'
import { PaymentPage } from './pages/PaymentPage'
import { BookingsPage } from './pages/BookingsPage'
import { ViewedToursPage } from './pages/ViewedToursPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { AdminGuard } from './pages/admin/AdminGuard'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { Dashboard } from './pages/admin/Dashboard'
import { StaffDashboard } from './pages/admin/StaffDashboard'
import { ToursAdminPage, PostsPage as PostsAdminPage, ThemePage, AboutAdminPage, BookingsAdminPage, AffiliatePage, AffiliateReportPage, AffiliatePaymentPage, RevenueReportPage, TourPerformancePage, CustomersAdminPage, StaffAdminPage, SettingsPage } from './pages/admin/sections'

function App() {
  return (
    <AppProviders>
      <div className="app-container">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tours" element={<ToursPage />} />
            <Route path="/tours/:id" element={<TourDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/guide/:id" element={<PostDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/viewed" element={<ViewedToursPage />} />
            
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={
              <AdminProviders>
                <AdminLoginPage />
              </AdminProviders>
            } />
            
            <Route path="/admin" element={
              <AdminProviders>
                <AdminGuard />
              </AdminProviders>
            }>
              <Route path="" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="staff-dashboard" element={<StaffDashboard />} />
                <Route path="tours" element={<ToursAdminPage />} />
                <Route path="posts" element={<PostsAdminPage />} />
                <Route path="customers" element={<CustomersAdminPage />} />
                <Route path="staff" element={<StaffAdminPage />} />
                <Route path="bookings" element={<BookingsAdminPage />} />
                <Route path="affiliates" element={<AffiliatePage />} />
                <Route path="affiliate-report" element={<AffiliateReportPage />} />
                <Route path="affiliate-payment" element={<AffiliatePaymentPage />} />
                <Route path="revenue-report" element={<RevenueReportPage />} />
                <Route path="tour-performance" element={<TourPerformancePage />} />
                <Route path="themes" element={<ThemePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="about" element={<AboutAdminPage />} />
              </Route>
            </Route>
          </Routes>
        </main>
      </div>
    </AppProviders>
  )
}

export default App