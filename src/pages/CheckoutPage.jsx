import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, CheckCircle, CreditCard, Bitcoin, Wallet } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../components/ui/Toast'
import { sendOrderConfirmation } from '../utils/email'

const PAYMENT_ICONS = {
  paypal: '💰',
  stripe: <CreditCard size={18} />,
  crypto: <Bitcoin size={18} />,
  bank: <Wallet size={18} />,
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user, profile } = useAuth()
  const { get, getJSON, settings } = useSettings()
  const navigate = useNavigate()
  const toast = useToast()
  const currency = get('currency_symbol', '$')
  const taxRate = parseFloat(get('tax_rate', '0')) / 100
  const paymentMethods = getJSON('payment_methods', ['paypal', 'stripe'])

  const [form, setForm] = useState({
    email: user?.email || '',
    name: profile?.display_name || '',
    roblox_username: profile?.roblox_username || '',
    payment: paymentMethods[0] || 'paypal',
    notes: '',
    discount_code: '',
  })
  const [discount, setDiscount] = useState(null)
  const [discountError, setDiscountError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: details, 2: payment, 3: confirmation
  const [order, setOrder] = useState(null)

  const tax = subtotal * taxRate
  const discountAmount = discount
    ? discount.type === 'percent'
      ? subtotal * (discount.value / 100)
      : Math.min(discount.value, subtotal)
    : 0
  const total = Math.max(0, subtotal - discountAmount + tax)

  async function applyDiscount() {
    setDiscountError('')
    if (!form.discount_code.trim()) return
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', form.discount_code.trim().toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !data) { setDiscountError('Invalid or expired code'); return }
    if (data.min_order > subtotal) { setDiscountError(`Minimum order: ${currency}${data.min_order}`); return }
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setDiscountError('Code expired'); return }
    if (data.max_uses && data.used_count >= data.max_uses) { setDiscountError('Code limit reached'); return }
    setDiscount(data)
    toast.success(`Discount applied: -${data.type === 'percent' ? data.value + '%' : currency + data.value}`)
  }

  async function placeOrder() {
    if (!form.email || !form.name || !form.roblox_username) {
      toast.error('Please fill in all required fields')
      return
    }
    setLoading(true)
    try {
      const orderData = {
        user_id: user?.id || null,
        guest_email: !user ? form.email : null,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image_url: i.image_url })),
        subtotal,
        tax,
        total,
        status: 'pending',
        payment_method: form.payment,
        payment_status: 'pending',
        roblox_username: form.roblox_username,
        notes: form.notes,
        delivery_details: { discount_code: form.discount_code, discount_amount: discountAmount },
      }
      const { data: newOrder, error } = await supabase.from('orders').insert(orderData).select().single()
      if (error) throw error

      // Update discount usage
      if (discount) {
        await supabase.from('discount_codes').update({ used_count: discount.used_count + 1 }).eq('id', discount.id)
      }

      // Send confirmation email
      await sendOrderConfirmation({
        order: newOrder,
        settings,
        customerEmail: form.email,
        customerName: form.name,
      })

      setOrder(newOrder)
      clearCart()
      setStep(3)
    } catch (err) {
      toast.error('Order failed: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && step !== 3) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <h2 style={{ marginBottom: 16 }}>Your cart is empty</h2>
        <button className="btn btn-primary" onClick={() => navigate('/shop')}>Go to Shop</button>
      </div>
    )
  }

  if (step === 3 && order) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px', maxWidth: 500, margin: '0 auto' }}>
        <CheckCircle size={64} color="var(--color-success)" style={{ margin: '0 auto 24px' }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Order Confirmed!</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
          Your order <strong style={{ color: 'var(--color-primary)' }}>{order.order_number}</strong> has been placed.
          A confirmation email has been sent to {form.email}.
        </p>

        {/* Payment instructions */}
        <div style={{ padding: 24, background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 16, marginBottom: 24, textAlign: 'left' }}>
          <h4 style={{ marginBottom: 12, fontWeight: 600 }}>Payment Instructions</h4>
          <PaymentInstructions method={form.payment} total={total} currency={currency} settings={{ paypal_email: get('paypal_email'), stripe_public_key: get('stripe_public_key') }} orderId={order.order_number} />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/orders')}>View Orders</button>
          <button className="btn btn-secondary" onClick={() => navigate('/shop')}>Continue Shopping</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: 900 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 32 }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
        {/* Left: Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Contact */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>1</span>
              Your Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 16, marginBottom: 0 }}>
              <label className="form-label">Roblox Username *</label>
              <input value={form.roblox_username} onChange={e => setForm(f => ({ ...f, roblox_username: e.target.value }))} placeholder="YourRobloxUsername" />
              <div className="form-hint">We'll deliver to this account</div>
            </div>
          </div>

          {/* Payment */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>2</span>
              Payment Method
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {paymentMethods.map(method => (
                <label key={method} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', borderRadius: 12,
                  border: `2px solid ${form.payment === method ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  cursor: 'pointer', background: form.payment === method ? 'rgba(99,102,241,0.08)' : 'transparent',
                  transition: 'var(--transition)'
                }}>
                  <input type="radio" name="payment" value={method} checked={form.payment === method}
                    onChange={() => setForm(f => ({ ...f, payment: method }))} style={{ width: 'auto', accentColor: 'var(--color-primary)' }} />
                  <span style={{ fontSize: 18 }}>{typeof PAYMENT_ICONS[method] === 'string' ? PAYMENT_ICONS[method] : ''}</span>
                  {typeof PAYMENT_ICONS[method] !== 'string' && PAYMENT_ICONS[method]}
                  <span style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: 14 }}>{method}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Order Notes (optional)</h3>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special instructions..." rows={3} />
          </div>
        </div>

        {/* Right: Summary */}
        <div style={{ position: 'sticky', top: 80 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(99,102,241,0.1)', overflow: 'hidden', flexShrink: 0 }}>
                    {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎮</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>x{item.quantity}</div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{currency}{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="divider" />

            {/* Discount code */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                value={form.discount_code}
                onChange={e => { setForm(f => ({ ...f, discount_code: e.target.value.toUpperCase() })); setDiscountError('') }}
                placeholder="Discount code"
                style={{ fontSize: 13 }}
                disabled={!!discount}
              />
              <button className="btn btn-secondary btn-sm" onClick={applyDiscount} disabled={!!discount} style={{ flexShrink: 0 }}>Apply</button>
            </div>
            {discountError && <div className="form-error" style={{ marginBottom: 12 }}>{discountError}</div>}
            {discount && <div style={{ fontSize: 13, color: 'var(--color-success)', marginBottom: 12 }}>✓ Code "{discount.code}" applied</div>}

            {/* Totals */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Row label="Subtotal" value={`${currency}${subtotal.toFixed(2)}`} />
              {discountAmount > 0 && <Row label="Discount" value={`-${currency}${discountAmount.toFixed(2)}`} color="var(--color-success)" />}
              {taxRate > 0 && <Row label={`Tax (${(taxRate * 100).toFixed(0)}%)`} value={`${currency}${tax.toFixed(2)}`} />}
              <div className="divider" style={{ margin: '4px 0' }} />
              <Row label="Total" value={`${currency}${total.toFixed(2)}`} bold />
            </div>

            <button className="btn btn-primary w-full btn-lg" style={{ marginTop: 20 }} onClick={placeOrder} disabled={loading}>
              {loading ? <div className="spinner spinner-sm" /> : <>Place Order · {currency}{total.toFixed(2)}</>}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, fontSize: 12, color: 'var(--color-text-muted)' }}>
              <Shield size={12} /> Secure checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 16 : 14 }}>
      <span style={{ color: bold ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 600, color: color || (bold ? 'var(--color-primary)' : 'inherit') }}>{value}</span>
    </div>
  )
}

function PaymentInstructions({ method, total, currency, settings, orderId }) {
  const instructions = {
    paypal: settings.paypal_email
      ? `Send ${currency}${total.toFixed(2)} to PayPal: ${settings.paypal_email}\nReference: ${orderId}`
      : 'PayPal details will be sent to your email.',
    stripe: 'You will be redirected to our secure payment page. Check your email for the payment link.',
    crypto: `Send ${currency}${total.toFixed(2)} worth of crypto.\nWallet addresses and rate will be emailed to you.\nReference: ${orderId}`,
    bank: `Bank transfer details:\nAmount: ${currency}${total.toFixed(2)}\nReference: ${orderId}\nDetails will be emailed shortly.`,
  }
  return (
    <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
      {instructions[method] || 'Payment instructions will be sent to your email.'}
    </p>
  )
}
