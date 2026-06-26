import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Search, Menu, X, Shield, Heart, Package, LogOut, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'

export default function Navbar({ onCartOpen }) {
  const { user, profile, isAdmin, signOut } = useAuth()
  const { itemCount } = useCart()
  const { get } = useSettings()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [search, setSearch] = useState('')

  const siteName = get('site_name', 'RobloxShop')
  const logoUrl = get('logo_url', '')

  function handleSearch(e) {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/shop?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'rgba(15,15,26,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 16 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {logoUrl ? (
            <img src={logoUrl} alt={siteName} style={{ height: 32, objectFit: 'contain' }} />
          ) : (
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 900, fontFamily: 'var(--font-display)'
            }}>R</div>
          )}
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>{siteName}</span>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 4, marginLeft: 8 }} className="nav-links">
          <Link to="/shop" style={{ padding: '8px 14px', borderRadius: 8, color: 'var(--color-text-muted)', fontSize: 14, fontWeight: 500, transition: 'var(--transition)' }}
            onMouseEnter={e => e.target.style.color = 'var(--color-text)'}
            onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}>Shop</Link>
          <Link to="/shop?featured=true" style={{ padding: '8px 14px', borderRadius: 8, color: 'var(--color-text-muted)', fontSize: 14, fontWeight: 500, transition: 'var(--transition)' }}
            onMouseEnter={e => e.target.style.color = 'var(--color-text)'}
            onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}>Featured</Link>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 360, display: 'flex', margin: '0 auto' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search items..."
              style={{ paddingLeft: 36, paddingRight: 12, height: 38, fontSize: 13, borderRadius: 8 }}
            />
          </div>
        </form>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
          {/* Cart */}
          <button className="btn btn-ghost" onClick={onCartOpen} style={{ position: 'relative', padding: '8px 10px' }}>
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                background: 'var(--color-primary)',
                color: '#fff', borderRadius: '50%',
                width: 18, height: 18,
                fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{itemCount > 9 ? '9+' : itemCount}</span>
            )}
          </button>

          {/* User */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-ghost"
                onClick={() => setUserMenuOpen(v => !v)}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px' }}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700
                }}>
                  {(profile?.display_name || user.email)?.[0]?.toUpperCase()}
                </div>
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 8,
                  background: 'var(--color-card)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius)', padding: 8, minWidth: 200,
                  boxShadow: 'var(--shadow)', zIndex: 300
                }}>
                  <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{profile?.display_name || 'User'}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{user.email}</div>
                    {isAdmin && <span className="badge badge-custom" style={{ marginTop: 6, fontSize: 10 }}>Admin</span>}
                  </div>
                  <MenuItem icon={<User size={14} />} label="My Profile" onClick={() => { navigate('/profile'); setUserMenuOpen(false) }} />
                  <MenuItem icon={<Package size={14} />} label="My Orders" onClick={() => { navigate('/orders'); setUserMenuOpen(false) }} />
                  <MenuItem icon={<Heart size={14} />} label="Wishlist" onClick={() => { navigate('/wishlist'); setUserMenuOpen(false) }} />
                  {isAdmin && (
                    <>
                      <div className="divider" style={{ margin: '8px 0' }} />
                      <MenuItem icon={<Shield size={14} />} label="Admin Dashboard" onClick={() => { navigate('/admin'); setUserMenuOpen(false) }} color="var(--color-primary)" />
                    </>
                  )}
                  <div className="divider" style={{ margin: '8px 0' }} />
                  <MenuItem icon={<LogOut size={14} />} label="Sign Out" onClick={handleSignOut} color="var(--color-danger)" />
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth" className="btn btn-primary btn-sm">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  )
}

function MenuItem({ icon, label, onClick, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px', borderRadius: 8, width: '100%',
        color: color || 'var(--color-text)', fontSize: 14,
        transition: 'var(--transition)', background: 'transparent',
        border: 'none', cursor: 'pointer', fontFamily: 'inherit'
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {icon}
      {label}
    </button>
  )
}
