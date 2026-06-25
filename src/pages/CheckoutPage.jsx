import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, CheckCircle, CreditCard, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../components/ui/Toast'
import { sendOrderConfirmation } from '../utils/email'

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user, profile } = useAuth()
  const { get, getJSON, settings } = useSettings()
  const navigate = useNavigate()
  const toast = useToast()

  const currency = get('currency_symbol', '$')
  const taxRate = parseFloat(get('tax_rate', '0')) / 100
  const builtinMethods = getJSON('payment_methods', ['paypal'])

  const [allMethods, setAllMethods] = useState([]) 
  const [customMethods, setCustomMethods] = useState([])
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [discount, setDiscount] = useState(null)
  const [discountError, setDiscountError] = useState('')
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    email: user?.email || '',
    name: profile?.display_name || '',
    roblox_username: profile?.roblox_username || '',
    payment: '',
    notes: '',
    discount_code: '',
  })

  useEffect(() => {
    if (user?.email && !form.email) setForm(f => ({ ...f, email: user.email }))
    if (profile?.display_name && !form.name) setForm(f => ({ ...f, name: profile.display_name }))
    if (profile?.roblox_username && !form.roblox_username) setForm(f => ({ ...f, roblox_username: profile.roblox_username }))
  }, [user, profile])

  useEffect(() => {
    loadPaymentMethods()
  }, [builtinMethods])

  async function loadPaymentMethods() {
    const { data } = await supabase
      .from('custom_payment_methods')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
    const custom = data || []
    setCustomMethods(custom)

    const builtin = builtinMethods.map(key => ({ key, label: key.charAt(0).toUpperCase() + key.slice(1), isCustom: false }))
    const customList = custom.map(m => ({ key: `custom_${m.id}`, label: m.name, icon: m.icon, isCustom: true, data: m }))
    const combined = [...builtin, ...customList]
    setAllMethods(combined)

    if (combined.length > 0 && !form.payment) {
      setForm(f => ({ ...f, payment: combined[0].key }))
    }
  }

  const tax = subtotal * taxRate
  const discountAmount = discount
    ? discount.type === 'percent' ? subtotal * (discount.value / 100) : Math.min(discount.value, subtotal)
    : 0
  const total = Math.max(0, subtotal - discountAmount + tax)

  const selectedMethod = allMethods.find(m => m.key === form.payment)
  const selectedCustom = selectedMethod?.isCustom ? selectedMethod.data : null

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
    if (data.expires_at && new Date(data.expires_at) < new Date()) { setDiscountError('Code has expired'); return }
    if (data.max_uses && data.used_count >= data.max_uses) { setDiscountError('Code usage limit reached'); return }
    setDiscount(data)
    toast.success(`Code applied — ${data.type === 'percent' ? `-${data.value}%` : `-${currency}${data.value}`}`)
  }

  async function placeOrder() {
    if (!form.email.trim()) { toast.error('Email is required'); return }
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.roblox_username.trim()) { toast.error('Roblox username is required'); return }
    if (!form.payment) { toast.error('Please select a payment method'); return }

    setLoading(true)
    try {
      const orderData = {
        user_id: user?.id || null,
        guest_email: form.email,
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image_url: i.image_url })),
        subtotal,
        tax,
        total,
        status: 'pending',
        payment_method: form.payment,
        payment_status: 'pending',
        roblox_username: form.roblox_username,
        notes: form.notes,
        delivery_details: {
          discount_code: form.discount_code || null,
          discount_amount: discountAmount,
          customer_name: form.name,
        },
      }

      // 1. Save initial record into PostgreSQL database
      const { data: newOrder, error } = await supabase.from('orders').insert(orderData).select().single()
      if (error) throw error

      if (discount) {
        await supabase.from('discount_codes').update({ used_count: discount.used_count + 1 }).eq('id', discount.id)
      }

      // 2. NOWPayments Secure Automation Loop via Edge Functions
      if (form.payment === 'crypto') {
        const { data: session, error: invokeError } = await supabase.functions.invoke('create-nowpayments-invoice', {
          body: { 
            orderId: newOrder.id,
            currency: 'usd'
          }
        })

        if (invokeError || !session?.invoice_url) {
          throw new Error(invokeError?.message || 'Could not generate crypto invoice.')
        }

        await sendOrderConfirmation({ order: newOrder, settings, customerEmail: form.email, customerName: form.name })
        clearCart()

        // Handoff user workflow to the dynamic gateway invoice url
        window.location.href = session.invoice_url
        return
      }

      // 3. Alternative standard manual routing fallback
      await sendOrderConfirmation({ order: newOrder, settings, customerEmail: form.email, customerName: form.name })
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
      <div style={{ textAlign: 'center', padding: '100px 24px' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🛒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 12 }}>Your cart is empty</h2>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/shop')}>Browse Shop</button>
      </div>
    )
  }

  // Confirmation panel markup layout logic
  if (step === 3 && order) {
    return (
      <div style={{ padding: '60px 24px', maxWidth: 560, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={36} color="var(--color-success)" />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Order Placed!</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Order <strong style={{ color: 'var(--color-primary)' }}>{order.order_number}</strong> confirmed.
            Check {form.email} for your receipt.
          </p>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h4 style={{ fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CreditCard size={18} color="var(--color-primary)" /> Payment Instructions
          </h4>
          {selectedCustom ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>{selectedCustom.icon}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>{selectedCustom.name}</div>
                  {selectedCustom.account_info && <div style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{selectedCustom.account_info}</div>}
                </div>
              </div>
              {selectedCustom.qr_code_url && (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <img src={selectedCustom.qr_code_url} alt="QR Code" style={{ width: 180, height: 180, objectFit: 'contain', background: '#fff', padding: 12, borderRadius: 12, border: '1px solid var(--color-border)' }} />
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>Scan to pay</div>
                </div>
              )}
              {selectedCustom.instructions && (
                <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7, whiteSpace: 'pre-line', background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 8 }}>
                  {selectedCustom.instructions.replace('{total}', `${currency}${total.toFixed(2)}`).replace('{order}', order.order_number)}
                </p>
              )}
            </div>
          ) : (
            <BuiltinInstructions method={form.payment} total={total} currency={currency} orderId={order.order_number} paypalEmail={get('paypal_email')} />
          )}
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 13, color: 'var(--color-warning)' }}>
            ⚠️ Include your order number <strong>{order.order_number}</strong> as payment reference
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/orders')}>My Orders</button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate('/shop')}>Keep Shopping</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '32px 24px', maxWidth: 960 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 32 }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>1</span>
              Your Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Doe" />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 14, marginBottom: 0 }}>
              <label className="form-label">Roblox Username *</label>
              <input value={form.roblox_username} onChange={e => setForm(f => ({ ...f, roblox_username: e.target.value }))} placeholder="YourRobloxUsername" />
              <div className="form-hint">We'll deliver to this Roblox account</div>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>2</span>
              Payment Method
            </h3>
            {allMethods.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>No payment methods configured. Please contact the shop.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {allMethods.map(method => (
                  <label key={method.key} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 12,
                    border: `2px solid ${form.payment === method.key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    cursor: 'pointer', background: form.payment === method.key ? 'rgba(99,102,241,0.08)' : 'transparent',
                    transition: 'var(--transition)'
                  }}>
                    <input type="radio" name="payment" value={method.key} checked={form.payment === method.key}
                      onChange={() => setForm(f => ({ ...f, payment: method.key }))} style={{ width: 'auto', accentColor: 'var(--color-primary)', flexShrink: 0 }} />
                    <span style={{ fontSize: 20 }}>{method.icon || getBuiltinIcon(method.key)}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{method.label}</div>
                      {method.isCustom && method.data?.description && (
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{method.data.description}</div>
                      )}
                    </div>
                    {method.isCustom && method.data?.qr_code_url && (
                      <span style={{ marginLeft: 'auto', fontSize: 11, background: 'rgba(99,102,241,0.15)', color: 'var(--color-primary)', padding: '2px 7px', borderRadius: 4, fontWeight: 600 }}>QR</span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Order Notes <span style={{ fontWeight: 400, color: 'var(--color-text-muted)', fontSize: 13 }}>(optional)</span></h3>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any special instructions for your order..." rows={3} />
          </div>
        </div>

        <div style={{ position: 'sticky', top: 80 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 18 }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(99,102,241,0.1)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} /> : <span>🎮</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>x{item.quantity}</div>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{currency}{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ height: 1, background: 'var(--color-border)', margin: '16px 0' }} />

            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={form.discount_code}
                  onChange={e => { setForm(f => ({ ...f, discount_code: e.target.value.toUpperCase() })); setDiscountError('') }}
                  placeholder="Discount code"
                  disabled={!!discount}
                  style={{ fontSize: 13 }}
                />
                <button className="btn btn-secondary btn-sm" onClick={applyDiscount} disabled={!!discount} style={{ flexShrink: 0 }}>Apply</button>
              </div>
              {discountError && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginTop: 5 }}>{discountError}</div>}
              {discount && <div style={{ fontSize: 12, color: 'var(--color-success)', marginTop: 5 }}>✓ "{discount.code}" applied</div>}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SummaryRow label="Subtotal" value={`${currency}${subtotal.toFixed(2)}`} />
              {discountAmount > 0 && <SummaryRow label="Discount" value={`-${currency}${discountAmount.toFixed(2)}`} color="var(--color-success)" />}
              {taxRate > 0 && <SummaryRow label={`Tax (${(taxRate * 100).toFixed(0)}%)`} value={`${currency}${tax.toFixed(2)}`} />}
              <div style={{ height: 1, background: 'var(--color-border)', margin: '4px 0' }} />
              <SummaryRow label="Total" value={`${currency}${total.toFixed(2)}`} bold />
            </div>

            <button className="btn btn-primary w-full btn-lg" style={{ marginTop: 18 }} onClick={placeOrder} disabled={loading || items.length === 0}>
              {loading ? <div className="spinner spinner-sm" /> : `Place Order · ${currency}${total.toFixed(2)}`}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, fontSize: 12, color: 'var(--color-text-muted)' }}>
              <Shield size={12} /> Secured checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getBuiltinIcon(key) {
  const icons = { paypal: '💰', stripe: '💳', crypto: '₿', bank: '🏦', cashapp: '💚', venmo: '🔵' }
  return icons[key] || '💳'
}

function SummaryRow({ label, value, bold, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: bold ? 16 : 13 }}>
      <span style={{ color: bold ? 'var(--color-text)' : 'var(--color-text-muted)', fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontWeight: bold ? 800 : 600, color: color || (bold ? 'var(--color-primary)' : 'inherit') }}>{value}</span>
    </div>
  )
}

function BuiltinInstructions({ method, total, currency, orderId, paypalEmail }) {
  const map = {
    paypal: paypalEmail ? `Send ${currency}${total.toFixed(2)} to PayPal:\n${paypalEmail}\n\nUse "Goods & Services" and include order number as note.` : 'PayPal payment details will be sent to your email shortly.',
    stripe: 'A secure payment link will be sent to your email. Click it to complete your card payment.',
    crypto: `Redirecting you to our secure payment gateway...`,
    bank: `Bank transfer details will be emailed to you.\nAmount: ${currency}${total.toFixed(2)}\nReference: ${orderId}`,
    cashapp: `Send ${currency}${total.toFixed(2)} via CashApp.\nDetails will be emailed to you.\nReference: ${orderId}`,
    venmo: `Send ${currency}${total.toFixed(2)} via Venmo.\nDetails will be emailed to you.\nReference: ${orderId}`,
  }
  return (
    <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
      {map[method] || 'Payment instructions will be sent to your email.'}
    </p>
  )
}
