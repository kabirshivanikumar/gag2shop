import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Zap, Shield, Clock, Star, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../context/SettingsContext'
import ProductCard from '../components/shop/ProductCard'

export default function HomePage() {
  const { get } = useSettings()
  const navigate = useNavigate()
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const headline = get('banner_headline', 'The #1 Roblox Shop')
  const subtext = get('banner_subtext', 'Top-tier game passes, items and accessories')
  const ctaText = get('hero_cta_text', 'Shop Now')
  const bannerUrl = get('banner_url', '')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*, categories(name)').eq('is_active', true).eq('is_featured', true).limit(8).order('sort_order'),
        supabase.from('categories').select('*').order('display_order')
      ])
      setFeatured((prodRes.data || []).map(p => ({ ...p, category_name: p.categories?.name })))
      setCategories(catRes.data || [])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Hero */}
      <section style={{
        minHeight: '80vh',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        background: bannerUrl
          ? `linear-gradient(to bottom, rgba(15,15,26,0.7), rgba(15,15,26,0.95)), url(${bannerUrl}) center/cover`
          : 'transparent'
      }}>
        {/* Animated background orbs */}
        {!bannerUrl && (
          <>
            <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', top: '-100px', left: '-100px', animation: 'float 8s ease-in-out infinite' }} />
            <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', bottom: 0, right: '-50px', animation: 'float 10s ease-in-out infinite reverse' }} />
          </>
        )}

        <style>{`
          @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
          @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 30px rgba(99,102,241,0.3); } 50% { box-shadow: 0 0 60px rgba(99,102,241,0.6); } }
        `}</style>

        <div className="container" style={{ padding: '80px 24px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 999, padding: '6px 16px', fontSize: 13, fontWeight: 600, marginBottom: 24, color: 'var(--color-primary)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block', animation: 'pulse-glow 2s infinite' }} />
            Instant Delivery · Trusted Shop
          </div>

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 6vw, 80px)',
            fontWeight: 800, lineHeight: 1.1,
            marginBottom: 20, letterSpacing: '-1px'
          }}>
            <span className="gradient-text">{headline}</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--color-text-muted)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.5 }}>
            {subtext}
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/shop')} style={{ fontSize: 16, padding: '14px 32px', animation: 'pulse-glow 3s infinite' }}>
              {ctaText} <ArrowRight size={18} />
            </button>
            <Link to="/shop?featured=true" className="btn btn-secondary btn-lg" style={{ fontSize: 16 }}>
              View Featured
            </Link>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap' }}>
            {[
              { icon: <Zap size={20} />, label: 'Instant Delivery' },
              { icon: <Shield size={20} />, label: '100% Secure' },
              { icon: <Clock size={20} />, label: '24/7 Support' },
              { icon: <Star size={20} />, label: '5-Star Rated' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-muted)', fontSize: 14 }}>
                <span style={{ color: 'var(--color-primary)' }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 className="section-title" style={{ marginBottom: 0 }}>Browse Categories</h2>
              <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)', fontSize: 14, fontWeight: 600 }}>
                See all <ChevronRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {categories.map(cat => (
                <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="card" style={{
                  padding: '20px 16px', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10
                }}>
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 10 }} />
                  ) : (
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                    }}>🎮</div>
                  )}
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{cat.name}</span>
                  {cat.description && <span style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>{cat.description}</span>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: 4 }}>Featured Items</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Hand-picked top sellers</p>
            </div>
            <Link to="/shop" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)', fontSize: 14, fontWeight: 600 }}>
              View all <ChevronRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
            </div>
          ) : featured.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>
              No featured products yet. Add some in the admin dashboard!
            </div>
          ) : (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
