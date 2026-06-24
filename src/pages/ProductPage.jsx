import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ShoppingCart, Zap, ArrowLeft, Star, Shield, Package, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../components/ui/Toast'

export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { get } = useSettings()
  const toast = useToast()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [imgIndex, setImgIndex] = useState(0)
  const currency = get('currency_symbol', '$')

  useEffect(() => {
    fetchProduct()
  }, [id])

  async function fetchProduct() {
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .eq('id', id)
      .single()
    setProduct(data)
    if (data?.category_id) {
      const { data: rel } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', data.category_id)
        .eq('is_active', true)
        .neq('id', id)
        .limit(4)
      setRelated(rel || [])
    }
    setLoading(false)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner spinner-lg" style={{ margin: '0 auto' }} /></div>
  if (!product) return <div style={{ textAlign: 'center', padding: 80 }}><h3>Product not found</h3></div>

  const images = [product.image_url, ...(product.images || [])].filter(Boolean)
  const discount = product.compare_price > product.price
    ? Math.round((1 - product.price / product.compare_price) * 100) : null

  function handleAddToCart() {
    addItem(product, quantity)
    toast.success(`${product.name} added to cart!`)
  }

  function handleBuyNow() {
    addItem(product, quantity)
    navigate('/checkout')
  }

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 24, color: 'var(--color-text-muted)' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
        {/* Images */}
        <div>
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', background: 'rgba(99,102,241,0.08)', aspectRatio: '1' }}>
            {images.length > 0 ? (
              <img src={images[imgIndex]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 80 }}>🎮</div>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setImgIndex(i => (i - 1 + images.length) % images.length)}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#fff' }}>
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => setImgIndex(i => (i + 1) % images.length)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 8, padding: 8, cursor: 'pointer', color: '#fff' }}>
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto' }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setImgIndex(i)}
                  style={{ width: 60, height: 60, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === imgIndex ? 'var(--color-primary)' : 'transparent'}`, flexShrink: 0 }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.categories?.name && (
            <div style={{ fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 8 }}>
              {product.categories.name}
            </div>
          )}

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
            {product.name}
          </h1>

          {product.badge && (
            <span className={`badge badge-${product.badge.toLowerCase() === 'new' ? 'new' : product.badge.toLowerCase() === 'hot' ? 'hot' : 'custom'}`} style={{ marginBottom: 16, display: 'inline-flex' }}>
              {product.badge}
            </span>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
              {currency}{Number(product.price).toFixed(2)}
            </span>
            {discount && (
              <>
                <span style={{ fontSize: 18, textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>
                  {currency}{Number(product.compare_price).toFixed(2)}
                </span>
                <span style={{ fontSize: 14, color: 'var(--color-success)', fontWeight: 700 }}>-{discount}%</span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div style={{ marginBottom: 28, color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: 15, whiteSpace: 'pre-wrap' }}>
              {product.description}
            </div>
          )}

          {/* Stock */}
          {product.stock > 0 && (
            <div style={{ fontSize: 13, color: product.stock < 10 ? 'var(--color-warning)' : 'var(--color-success)', marginBottom: 16, fontWeight: 600 }}>
              {product.stock < 10 ? `⚠️ Only ${product.stock} left!` : `✓ In Stock (${product.stock})`}
            </div>
          )}
          {product.stock === 0 && (
            <div style={{ fontSize: 13, color: 'var(--color-danger)', marginBottom: 16, fontWeight: 600 }}>✗ Out of Stock</div>
          )}

          {/* Quantity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontWeight: 600 }}>QTY</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(255,255,255,0.05)', borderRadius: 10, border: '1px solid var(--color-border)' }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--color-text)' }}>-</button>
              <span style={{ width: 36, textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)}
                style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--color-text)' }}>+</button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
            <button className="btn btn-secondary" onClick={handleAddToCart} disabled={product.stock === 0} style={{ flex: 1, padding: '14px' }}>
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button className="btn btn-primary btn-lg" onClick={handleBuyNow} disabled={product.stock === 0} style={{ flex: 1, padding: '14px' }}>
              <Zap size={18} /> Buy Now
            </button>
          </div>

          {/* Trust */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
            {[
              { icon: <Zap size={15} color="var(--color-primary)" />, text: 'Instant digital delivery after payment' },
              { icon: <Shield size={15} color="var(--color-success)" />, text: 'Secure checkout & buyer protection' },
              { icon: <Package size={15} color="var(--color-accent)" />, text: product.delivery_info || 'Item delivered to your Roblox account' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--color-text-muted)' }}>
                {icon} {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tags */}
      {product.tags?.length > 0 && (
        <div style={{ marginTop: 32, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {product.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
      )}
    </div>
  )
}
