import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'
import { useNavigate } from 'react-router-dom'

export default function CartSidebar({ open, onClose }) {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart()
  const { get } = useSettings()
  const navigate = useNavigate()
  const currency = get('currency_symbol', '$')

  if (!open) return null

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400, backdropFilter: 'blur(2px)' }} />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 420, maxWidth: '100vw',
        background: 'var(--color-card)', borderLeft: '1px solid var(--color-border)',
        zIndex: 500, display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.25s ease'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={20} color="var(--color-primary)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Your Cart</span>
            <span style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
              {items.length}
            </span>
          </div>
          <button className="btn btn-ghost" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <ShoppingBag size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--color-text-muted)' }}>Your cart is empty</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={onClose}>Browse Shop</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(item => (
                <div key={item.id} style={{
                  display: 'flex', gap: 12, padding: 14,
                  background: 'rgba(255,255,255,0.03)', borderRadius: 12,
                  border: '1px solid var(--color-border)'
                }}>
                  {/* Image */}
                  <div style={{
                    width: 60, height: 60, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(99,102,241,0.1)', overflow: 'hidden'
                  }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🎮</div>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.name}</div>
                    <div style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: 15 }}>
                      {currency}{(item.price * item.quantity).toFixed(2)}
                    </div>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      ><Minus size={12} /></button>
                      <span style={{ fontSize: 14, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{ width: 26, height: 26, borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      ><Plus size={12} /></button>
                    </div>
                  </div>

                  <button onClick={() => removeItem(item.id)} style={{ alignSelf: 'flex-start', padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger)', borderRadius: 6, transition: 'var(--transition)' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '20px 24px', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Subtotal</span>
              <span style={{ fontWeight: 700, fontSize: 18 }}>{currency}{subtotal.toFixed(2)}</span>
            </div>
            <button className="btn btn-primary w-full btn-lg" onClick={() => { onClose(); navigate('/checkout') }}>
              Proceed to Checkout
            </button>
            <button onClick={clearCart} style={{ width: '100%', marginTop: 8, padding: '8px', background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: 13, cursor: 'pointer' }}>
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}
