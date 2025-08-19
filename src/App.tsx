import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { ToursPage } from './pages/ToursPage'
import { GuidePage } from './pages/GuidePage'
import { ContactPage } from './pages/ContactPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { BookingsPage } from './pages/BookingsPage'
import { ViewedToursPage } from './pages/ViewedToursPage'
import { PaymentPage } from './pages/PaymentPage'
import { AppProviders } from './context/AppProviders'
import { ProfilePage } from './pages/ProfilePage'
import { AdminProviders } from './context/AdminProviders'
import { AdminGuard } from './pages/admin/AdminGuard'
import { AdminLoginPage } from './pages/admin/AdminLoginPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { Dashboard } from './pages/admin/Dashboard'
import { CustomersPage, StaffPage, ToursAdminPage, PostsPage, ThemePage, AboutAdminPage, BookingsAdminPage, AffiliatePage } from './pages/admin/sections'
import { TourDetailPage } from './pages/TourDetailPage'

function App() {
  return (
    <AppProviders>
      <div className="app-container">
        <Header />
        <main className="app-main">
          <Routes>
            {/* All public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/tours" element={<ToursPage />} />
            <Route path="/tours/:id" element={<TourDetailPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/viewed" element={<ViewedToursPage />} />
            <Route path="/payment" element={<PaymentPage />} />

            {/* Admin routes must come before the catch-all route */}
            <Route path="/admin/login" element={<AdminProviders><AdminLoginPage /></AdminProviders>} />
            <Route element={<AdminProviders><AdminGuard /></AdminProviders>}>
              <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
              <Route path="/admin/customers" element={<AdminLayout><CustomersPage /></AdminLayout>} />
              <Route path="/admin/staff" element={<AdminLayout><StaffPage /></AdminLayout>} />
              <Route path="/admin/tours" element={<AdminLayout><ToursAdminPage /></AdminLayout>} />
              <Route path="/admin/posts" element={<AdminLayout><PostsPage /></AdminLayout>} />
              <Route path="/admin/theme" element={<AdminLayout><ThemePage /></AdminLayout>} />
              <Route path="/admin/about" element={<AdminLayout><AboutAdminPage /></AdminLayout>} />
              <Route path="/admin/bookings" element={<AdminLayout><BookingsAdminPage /></AdminLayout>} />
              <Route path="/admin/affiliate" element={<AdminLayout><AffiliatePage /></AdminLayout>} />
            </Route>
            
            {/* The wildcard route MUST be the last one */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AppProviders>
  );
}

export default App;