import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Settings,
  Tag, Percent, Star, LogOut, Menu, X, TrendingUp, DollarSign,
  ShoppingCart, Eye
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { supabase } from '../lib/supabase'

// Admin sub-pages
import AdminOverview from './AdminOverview'
import AdminProducts from './AdminProducts'
import AdminOrders from './AdminOrders'
import AdminUsers from './AdminUsers'
import AdminCategories from './AdminCategories'
import AdminDiscounts from './AdminDiscounts'
import AdminSettings from './AdminSettings'

const NAV_ITEMS = [
  { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={17} /> },
  { key: 'products', label: 'Products', icon: <Package size={17} /> },
  { key: 'orders', label: 'Orders', icon: <ShoppingBag size={17} /> },
  { key: 'users', label: 'Customers', icon: <Users size={17} /> },
  { key: 'categories', label: 'Categories', icon: <Tag size={17} /> },
  { key: 'discounts', label: 'Discounts', icon: <Percent size={17} /> },
  { key: 'settings', label: 'Settings', icon: <Settings size={17} /> },
]

export default function AdminDashboard() {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { get } = useSettings()
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    // 1. If no user is logged in, redirect to auth page
    if (!user) { 
      navigate('/auth')
      return 
    }
    
    // 2. Safely compute if they are an admin by checking both the context flag AND the database role string
    const userRole = profile?.role || user?.user_metadata?.role
    const hasAdminAccess = isAdmin || userRole === 'admin'

    // 3. Only kick them out if profile data has finished loading and they are definitively NOT an admin
    if (profile !== null && !hasAdminAccess) { 
      navigate('/')
      return 
    }
  }, [user, isAdmin, profile, navigate])

  // Compute validation helper for the template layout safety
  const verifiedAdmin = isAdmin || profile?.role === 'admin'

  if (!user || !verifiedAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--color-text-muted)' }}>Checking permissions...</p>
      </div>
    )
  }

  const siteName = get('site_name', 'RobloxShop')

  const COMPONENTS = {
    overview: <AdminOverview onTab={setTab} />,
    products: <AdminProducts />,
    orders: <AdminOrders />,
    users: <AdminUsers />,
    categories: <AdminCategories />,
    discounts: <AdminDiscounts />,
    settings: <AdminSettings />,
  }

  return (
    <div className="admin-layout" style={{ background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-display)'
            }}>R</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{siteName}</div>
              <div style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600 }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV_ITEMS.map(item => (
            <button
              key={item.key}
              className={`admin-nav-item ${tab === item.key ? 'active' : ''}`}
              onClick={() => setTab(item.key)}
              style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid var(--color-border)' }}>
          <button className="admin-nav-item" onClick={() => navigate('/')} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Eye size={17} /> View Store
          </button>
          <button className="admin-nav-item" onClick={async () => { await signOut(); navigate('/') }} style={{ width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--color-danger)' }}>
            <LogOut size={17} /> Sign Out
          </button>
          <div style={{ padding: '8px 12px', fontSize: 12, color: 'var(--color-text-muted)' }}>
            {profile?.display_name || 'Admin'}<br />
            <span style={{ fontSize: 11 }}>{user.email}</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-content">
        <div style={{ maxWidth: 1200 }}>
          {/* Page title */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>
              {NAV_ITEMS.find(n => n.key === tab)?.label}
            </h1>
          </div>
          {COMPONENTS[tab]}
        </div>
      </main>
    </div>
  )
}
