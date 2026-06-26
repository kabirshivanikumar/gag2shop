import { useState } from 'react'
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../ui/Toast'

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { get } = useSettings()
  const navigate = useNavigate()
  const toast = useToast()
  const [liked, setLiked] = useState(false)
  const [adding, setAdding] = useState(false)
  const currency = get('currency_symbol', '$')

  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null

  function handleAdd(e) {
    e.stopPropagation()
    setAdding(true)
    addItem(product)
    toast.success(`${product.name} added to cart!`)
    setTimeout(() => setAdding(false), 600)
  }

  function getBadgeClass(badge) {
    if (!badge) return ''
    const lower = badge.toLowerCase()
    if (lower === 'new') return 'badge-new'
    if (lower === 'hot') return 'badge-hot'
    if (lower === 'sale') return 'badge-sale'
    return 'badge-custom'
  }

  return (
    <div className="card" style={{ overflow: 'hidden', cursor: 'pointer', position: 'relative' }} onClick={() => navigate(`/product/${product.id}`)}>
      {/* Image */}
      <div style={{ position: 'relative', paddingTop: '70%', background: 'rgba(99,102,241,0.08)', overflow: 'hidden' }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🎮</div>
        )}

        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {product.badge && <span className={`badge ${getBadgeClass(product.badge)}`}>{product.badge}</span>}
          {discount && <span className="badge badge-sale">-{discount}%</span>}
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); setLiked(v => !v) }}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 32, height: 32, borderRadius: 8,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer', color: liked ? '#ef4444' : '#fff',
            transition: 'var(--transition)'
          }}
        >
          <Heart size={14} fill={liked ? '#ef4444' : 'none'} />
        </button>

        {/* Stock badge */}
        {product.stock === 0 && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: 'var(--color-text-muted)'
          }}>Out of Stock</div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>
          {product.category_name || 'Uncategorized'}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {product.name}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
          <div>
            <span className="price-current">{currency}{Number(product.price).toFixed(2)}</span>
            {product.compare_price > product.price && (
              <span className="price-old" style={{ marginLeft: 8 }}>{currency}{Number(product.compare_price).toFixed(2)}</span>
            )}
          </div>

          <button
            className={`btn btn-primary btn-sm ${adding ? 'btn-success' : ''}`}
            onClick={handleAdd}
            disabled={product.stock === 0}
            style={{ padding: '7px 12px' }}
          >
            {adding ? '✓' : <ShoppingCart size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
