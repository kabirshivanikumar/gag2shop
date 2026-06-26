import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MessageSquare, Clock, CheckCircle, Send, ChevronDown } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'

const SUPPORT_EMAIL = 'support@voidenterprises.xyz'

const SUBJECTS = [
  'Order Issue / Not Received',
  'Wrong Item Delivered',
  'Refund Request',
  'Payment Problem',
  'Account Issue',
  'Product Question',
  'Partnership / Business',
  'Other',
]

const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'Most digital items are delivered within 1–24 hours after payment confirmation. Some items are instant. Check the product page for specific delivery times.',
  },
  {
    q: 'My item hasn\'t arrived — what do I do?',
    a: 'First check your order status on the My Orders page. If it shows "paid" but no delivery after 24 hours, contact us with your order number and we\'ll resolve it immediately.',
  },
  {
    q: 'Can I get a refund?',
    a: 'Refunds are available for undelivered orders. Once an item is delivered to your Roblox account, we cannot issue a refund. See our Terms of Service for full details.',
  },
  {
    q: 'I entered the wrong Roblox username — help!',
    a: 'Contact us immediately via this form or email. If your order hasn\'t been processed yet, we can update it. Act fast — delivered orders to wrong usernames may not be recoverable.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'We accept PayPal, Stripe (card), crypto, and various local payment methods. Available options are shown at checkout.',
  },
  {
    q: 'Is this site affiliated with Roblox?',
    a: 'No. VoidEnterprises is an independent reseller and is not affiliated with, endorsed by, or officially connected to Roblox Corporation.',
  },
]

export default function ContactPage() {
  const { get } = useSettings()
  const { user, profile } = useAuth()
  const siteName = get('site_name', 'VoidEnterprises')
  const discord = get('social_discord', '')

  const [form, setForm] = useState({
    name: profile?.display_name || '',
    email: user?.email || '',
    subject: '',
    order_number: '',
    message: '',
  })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [openFaq, setOpenFaq] = useState(null)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.trim() || !form.subject || !form.message.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setSending(true)
    try {
      // Build mailto link and open email client
      // For production, swap this with EmailJS or a Supabase Edge Function
      const subject = encodeURIComponent(`[${siteName} Support] ${form.subject}${form.order_number ? ` - Order ${form.order_number}` : ''}`)
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject}\n${form.order_number ? `Order #: ${form.order_number}\n` : ''}\nMessage:\n${form.message}`
      )
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
      // Small delay then show success
      await new Promise(r => setTimeout(r, 800))
      setSent(true)
    } catch {
      setError('Something went wrong. Please email us directly at ' + SUPPORT_EMAIL)
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(6,182,212,0.08) 100%)',
        borderBottom: '1px solid var(--color-border)',
        padding: '56px 24px 48px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: 12 }}>
          Contact Us
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
          We're here to help. Send us a message and we'll get back to you within 24 hours.
        </p>
      </div>

      <div className="container" style={{ padding: '48px 24px', maxWidth: 1000 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start' }}>

          {/* Left — Form */}
          <div>
            {sent ? (
              <div style={{
                textAlign: 'center', padding: '60px 40px',
                background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 20
              }}>
                <CheckCircle size={52} color="var(--color-success)" style={{ margin: '0 auto 20px' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Message Sent!</h3>
                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 24 }}>
                  Your email client should have opened with a pre-filled message.<br />
                  We'll reply to <strong style={{ color: 'var(--color-text)' }}>{form.email}</strong> within 24 hours.
                </p>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 24 }}>
                  Alternatively, email us directly at{' '}
                  <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--color-primary)' }}>{SUPPORT_EMAIL}</a>
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary" onClick={() => { setSent(false); setForm(f => ({ ...f, message: '', subject: '', order_number: '' })) }}>
                    Send Another
                  </button>
                  <Link to="/orders" className="btn btn-primary">My Orders</Link>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 32 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 24 }}>
                  Send a Message
                </h2>
                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Your Name *</label>
                      <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Email Address *</label>
                      <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Subject *</label>
                      <select value={form.subject} onChange={e => set('subject', e.target.value)}>
                        <option value="">— Select a topic —</option>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Order Number</label>
                      <input
                        value={form.order_number}
                        onChange={e => set('order_number', e.target.value.toUpperCase())}
                        placeholder="RBX-20250601-12345"
                      />
                      <div className="form-hint">If your issue is order-related</div>
                    </div>
                  </div>

                  <div className="form-group" style={{ marginTop: 14 }}>
                    <label className="form-label">Message *</label>
                    <textarea
                      rows={6}
                      value={form.message}
                      onChange={e => set('message', e.target.value)}
                      placeholder="Describe your issue in as much detail as possible. Include your Roblox username, what you ordered, and what happened."
                    />
                  </div>

                  {error && (
                    <div style={{
                      padding: '10px 14px', background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8,
                      color: 'var(--color-danger)', fontSize: 13, marginBottom: 16
                    }}>{error}</div>
                  )}

                  <button type="submit" className="btn btn-primary w-full btn-lg" disabled={sending}>
                    {sending
                      ? <div className="spinner spinner-sm" />
                      : <><Send size={16} /> Send Message</>
                    }
                  </button>

                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', marginTop: 12 }}>
                    This opens your email client. You can also email us directly at{' '}
                    <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--color-primary)' }}>{SUPPORT_EMAIL}</a>
                  </p>
                </form>
              </div>
            )}

            {/* FAQ */}
            <div style={{ marginTop: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, marginBottom: 16 }}>
                Frequently Asked Questions
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {FAQS.map((faq, i) => (
                  <div key={i} className="card" style={{ overflow: 'hidden' }}>
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      style={{
                        width: '100%', padding: '16px 20px', background: 'none', border: 'none',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: 12, textAlign: 'left', fontFamily: 'inherit', color: 'var(--color-text)'
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{faq.q}</span>
                      <ChevronDown size={16} color="var(--color-text-muted)" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }} />
                    </button>
                    {openFaq === i && (
                      <div style={{ padding: '0 20px 16px', fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.7, borderTop: '1px solid var(--color-border)', paddingTop: 14, marginTop: -2 }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Info cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 80 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Mail size={20} color="var(--color-primary)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Email Support</div>
                  <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--color-primary)', fontSize: 14, wordBreak: 'break-all' }}>{SUPPORT_EMAIL}</a>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>Best for order issues & refunds</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6,182,212,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Clock size={20} color="var(--color-accent)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Response Time</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                    Usually within <strong style={{ color: 'var(--color-text)' }}>24 hours</strong><br />
                    Often much faster
                  </div>
                </div>
              </div>
            </div>

            {discord && (
              <a href={discord} target="_blank" rel="noreferrer" className="card" style={{ padding: 24, display: 'flex', alignItems: 'flex-start', gap: 14, textDecoration: 'none', transition: 'var(--transition)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(88,101,242,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.079.114 18.1.135 18.11a19.916 19.916 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 13.944 13.944 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.14 13.14 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--color-text)' }}>Discord Community</div>
                  <div style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Join for instant community support</div>
                  <div style={{ fontSize: 12, color: '#5865F2', marginTop: 4 }}>Join Server →</div>
                </div>
              </a>
            )}

            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(16,185,129,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={20} color="var(--color-success)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Before contacting us…</div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                    Have your <strong style={{ color: 'var(--color-text)' }}>Order Number</strong> and <strong style={{ color: 'var(--color-text)' }}>Roblox Username</strong> ready — it helps us resolve issues much faster.
                  </div>
                  <Link to="/orders" style={{ display: 'inline-block', marginTop: 10, fontSize: 13, color: 'var(--color-primary)', fontWeight: 600 }}>
                    Check My Orders →
                  </Link>
                </div>
              </div>
            </div>

            <div style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                <Link to="/terms" style={{ color: 'var(--color-primary)' }}>Terms of Service</Link>
                {' · '}
                <Link to="/privacy" style={{ color: 'var(--color-primary)' }}>Privacy Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
