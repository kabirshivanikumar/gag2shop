import { useEffect, useRef } from 'react'
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight, Tag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useSettings } from '../../context/SettingsContext'
import { useNavigate } from 'react-router-dom'

export default function CartSidebar({ open, onClose }) {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart()
  const { get } = useSettings()
  const navigate = useNavigate()
  const currency = get('currency_symbol', '$')
  const sidebarRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Trap focus inside sidebar for accessibility
  useEffect(() => {
    if (open && sidebarRef.current) {
      sidebarRef.current.focus()
    }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(3px)',
          zIndex: 400,
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Sidebar panel */}
      <div
        ref={sidebarRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        style={{
          position: 'fixed',
          right: 0, top: 0, bottom: 0,
          width: 'min(420px, 100vw)',
          background: 'var(--color-card)',
          borderLeft: '1px solid var(--color-border)',
          zIndex: 500,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          outline: 'none',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={20} color="var(--color-primary)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>
              Your Cart
            </span>
            {items.length > 0 && (
              <span style={{
                background: 'var(--color-primary)', color: '#fff',
                borderRadius: '50%', width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {items.length > 0 && (
              <button
                onClick={() => { if (confirm('Clear all items from cart?')) clearCart() }}
                style={{ fontSize: 12, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 8px', borderRadius: 6, transition: 'var(--transition)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'none' }}
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close cart"
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer', color: 'var(--color-text-muted)', transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'var(--color-text)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <ShoppingBag size={52} color="var(--color-text-muted)" style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Cart is empty</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 24 }}>
                Browse our products and add something you like!
              </p>
              <button
                className="btn btn-primary"
                onClick={() => { onClose(); navigate('/shop') }}
              >
                Browse Shop <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {items.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  currency={currency}
                  onRemove={() => removeItem(item.id)}
                  onQtyChange={(q) => updateQuantity(item.id, q)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--color-border)',
            background: 'rgba(0,0,0,0.2)',
            flexShrink: 0,
          }}>
            {/* Subtotal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Subtotal</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--color-primary)' }}>
                {currency}{subtotal.toFixed(2)}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 14 }}>
              Taxes and discounts applied at checkout
            </p>

            {/* CTA */}
            <button
              className="btn btn-primary w-full btn-lg"
              onClick={() => { onClose(); navigate('/checkout') }}
              style={{ fontSize: 15, padding: '13px', marginBottom: 10 }}
            >
              Checkout — {currency}{subtotal.toFixed(2)} <ArrowRight size={17} />
            </button>
            <button
              onClick={() => { onClose(); navigate('/shop') }}
              style={{
                width: '100%', padding: '10px', background: 'none', border: '1px solid var(--color-border)',
                borderRadius: 10, color: 'var(--color-text-muted)', fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'var(--transition)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'var(--color-text)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
            >
              Continue Shopping
            </button>

            {/* Trust badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 14 }}>
              {['🔒 Secure', '⚡ Fast Delivery', '🔄 Refunds'].map(b => (
                <span key={b} style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{b}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function CartItem({ item, currency, onRemove, onQtyChange }) {
  const discount = item.compare_price && item.compare_price > item.price
    ? Math.round((1 - item.price / item.compare_price) * 100) : null

  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      transition: 'var(--transition)',
      position: 'relative',
    }}>
      {/* Image */}
      <div style={{
        width: 64, height: 64, borderRadius: 9, flexShrink: 0,
        background: 'rgba(99,102,241,0.1)', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {item.image_url
          ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
          : <span style={{ fontSize: 26 }}>🎮</span>
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 28 }}>
          {item.name}
        </div>

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--color-primary)' }}>
            {currency}{(item.price * item.quantity).toFixed(2)}
          </span>
          {discount && (
            <span style={{ fontSize: 11, background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
              -{discount}%
            </span>
          )}
          {item.quantity > 1 && (
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              ({currency}{item.price.toFixed(2)} each)
            </span>
          )}
        </div>

        {/* Quantity controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--color-border)',
            borderRadius: 8, overflow: 'hidden',
          }}>
            <QtyBtn onClick={() => onQtyChange(item.quantity - 1)} disabled={item.quantity <= 1}>
              <Minus size={11} />
            </QtyBtn>
            <span style={{ minWidth: 28, textAlign: 'center', fontSize: 13, fontWeight: 700, padding: '0 4px' }}>
              {item.quantity}
            </span>
            <QtyBtn onClick={() => onQtyChange(item.quantity + 1)}>
              <Plus size={11} />
            </QtyBtn>
          </div>

          {/* Delete button */}
          <button
            onClick={onRemove}
            aria-label={`Remove ${item.name}`}
            title="Remove item"
            style={{
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 7, cursor: 'pointer', color: 'var(--color-danger)',
              transition: 'var(--transition)', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)' }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}

function QtyBtn({ onClick, children, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'none', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
        opacity: disabled ? 0.4 : 1, transition: 'var(--transition)',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
    >
      {children}
    </button>
  )
}
