import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import { ToastProvider } from './components/ui/Toast'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CartSidebar from './components/cart/CartSidebar'
import HomePage from './pages/HomePage'
import ShopPage from './pages/ShopPage'
import ProductPage from './pages/ProductPage'
import AuthPage from './pages/AuthPage'
import CheckoutPage from './pages/CheckoutPage'
import OrdersPage from './pages/OrdersPage'
import ProfilePage from './pages/ProfilePage'
import TermsPage from './pages/TermsPage'       // Imported Terms Component
import PrivacyPage from './pages/PrivacyPage'   // Imported Privacy Component
import AdminDashboard from './admin/AdminDashboard'

function Ticker() {
  const { get } = useSettings()
  const enabled = get('ticker_enabled', 'true') === 'true'
  const text = get('ticker_text', '🎮 Welcome to RobloxShop · 🔥 New items added daily')
  if (!enabled) return null
  return (
    <div className="ticker-wrap">
      <div className="ticker-inner">&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{text}&nbsp;&nbsp;&nbsp;</div>
    </div>
  )
}

function MaintenanceGuard({ children }) {
  const { get } = useSettings()
  const maintenance = get('maintenance_mode', 'false') === 'true'
  if (maintenance) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
        <div>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🔧</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Under Maintenance</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 16 }}>We will be back shortly. Check our Discord for updates.</p>
        </div>
      </div>
    )
  }
  return children
}

function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 24px' }}>
      <div style={{ fontSize: 72, marginBottom: 20, fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--color-primary)' }}>404</div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Page Not Found</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>This page does not exist or was moved.</p>
      <a href="/" className="btn btn-primary">Back to Home</a>
    </div>
  )
}

function ShopLayout() {
  const [cartOpen, setCartOpen] = useState(false)
  return (
    <>
      <div className="glow-bg" />
      <Ticker />
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <MaintenanceGuard>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/terms" element={<TermsPage />} />         {/* Registered Terms Route */}
            <Route path="/privacy" element={<PrivacyPage />} />     {/* Registered Privacy Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MaintenanceGuard>
      </main>
      <Footer />
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Routes>
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="/*" element={<ShopLayout />} />
              </Routes>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </SettingsProvider>
    </BrowserRouter>
  )
}
