import { useState } from 'react'
import { Save, Palette, Globe, CreditCard, Mail, Store, Megaphone, ToggleLeft, ToggleRight } from 'lucide-react'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../components/ui/Toast'

const TABS = [
  { key: 'general', label: 'General', icon: <Store size={15} /> },
  { key: 'appearance', label: 'Appearance', icon: <Palette size={15} /> },
  { key: 'ticker', label: 'Ticker & Banner', icon: <Megaphone size={15} /> },
  { key: 'payments', label: 'Payments', icon: <CreditCard size={15} /> },
  { key: 'email', label: 'Email', icon: <Mail size={15} /> },
  { key: 'social', label: 'Social & SEO', icon: <Globe size={15} /> },
]

export default function AdminSettings() {
  const { settings, updateSettings, get } = useSettings()
  const toast = useToast()
  const [tab, setTab] = useState('general')
  const [local, setLocal] = useState({})
  const [saving, setSaving] = useState(false)

  function val(key) {
    return local[key] !== undefined ? local[key] : (settings[key] ?? '')
  }
  function set(key, value) {
    setLocal(l => ({ ...l, [key]: value }))
  }

  async function save() {
    setSaving(true)
    try {
      await updateSettings(local)
      setLocal({})
      toast.success('Settings saved!')
    } catch (e) {
      toast.error('Save failed: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  const paymentMethods = (() => {
    try { return JSON.parse(val('payment_methods') || '[]') } catch { return [] }
  })()

  function togglePayment(method) {
    const cur = paymentMethods
    const next = cur.includes(method) ? cur.filter(m => m !== method) : [...cur, method]
    set('payment_methods', JSON.stringify(next))
  }

  const hasChanges = Object.keys(local).length > 0

  return (
    <div>
      {/* Save bar */}
      {hasChanges && (
        <div style={{
          position: 'sticky', top: 70, zIndex: 50, marginBottom: 20,
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
          borderRadius: 'var(--radius)', padding: '12px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>You have unsaved changes</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setLocal({})}>Discard</button>
            <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
              {saving ? <div className="spinner spinner-sm" /> : <><Save size={14} /> Save All</>}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        {/* Sidebar tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10, border: 'none',
                cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
                background: tab === t.key ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: tab === t.key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                textAlign: 'left', transition: 'var(--transition)'
              }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Settings panel */}
        <div className="card" style={{ padding: 28 }}>
          {/* GENERAL */}
          {tab === 'general' && (
            <div>
              <SectionTitle>Site Identity</SectionTitle>
              <FG label="Site Name" hint="Appears in navbar and browser tab">
                <input value={val('site_name')} onChange={e => set('site_name', e.target.value)} placeholder="RobloxShop" />
              </FG>
              <FG label="Tagline">
                <input value={val('site_tagline')} onChange={e => set('site_tagline', e.target.value)} placeholder="Premium Roblox Items & Game Passes" />
              </FG>
              <FG label="Logo URL" hint="Leave blank to use text logo">
                <input value={val('logo_url')} onChange={e => set('logo_url', e.target.value)} placeholder="https://yourcdn.com/logo.png" />
              </FG>
              <FG label="Footer Text">
                <input value={val('footer_text')} onChange={e => set('footer_text', e.target.value)} placeholder="© 2025 RobloxShop" />
              </FG>
              <div className="divider" />
              <SectionTitle>Currency</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FG label="Currency Symbol">
                  <input value={val('currency_symbol')} onChange={e => set('currency_symbol', e.target.value)} placeholder="$" />
                </FG>
                <FG label="Currency Code">
                  <input value={val('currency_code')} onChange={e => set('currency_code', e.target.value)} placeholder="USD" />
                </FG>
              </div>
              <div className="divider" />
              <SectionTitle>Tax & Pricing</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FG label="Tax Rate (%)" hint="0 = no tax">
                  <input type="number" min="0" max="100" step="0.1" value={val('tax_rate')} onChange={e => set('tax_rate', e.target.value)} placeholder="0" />
                </FG>
                <FG label="Free Shipping Threshold" hint="0 = no threshold">
                  <input type="number" min="0" step="0.01" value={val('free_shipping_threshold')} onChange={e => set('free_shipping_threshold', e.target.value)} placeholder="0" />
                </FG>
              </div>
              <div className="divider" />
              <SectionTitle>Maintenance</SectionTitle>
              <Toggle label="Maintenance Mode" hint="Prevents customers from accessing the shop" value={val('maintenance_mode') === 'true'} onChange={v => set('maintenance_mode', String(v))} />
            </div>
          )}

          {/* APPEARANCE */}
          {tab === 'appearance' && (
            <div>
              <SectionTitle>Brand Colors</SectionTitle>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>Changes apply instantly across the whole site</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {[
                  { key: 'primary_color', label: 'Primary Color', hint: 'Buttons, links, accents' },
                  { key: 'secondary_color', label: 'Secondary Color', hint: 'Gradients, hover states' },
                  { key: 'accent_color', label: 'Accent Color', hint: 'Highlights, badges' },
                  { key: 'background_dark', label: 'Background', hint: 'Main page background' },
                  { key: 'background_card', label: 'Card Background', hint: 'Cards and panels' },
                  { key: 'text_primary', label: 'Text Color', hint: 'Main text color' },
                ].map(({ key, label, hint }) => (
                  <div key={key} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                    <label className="form-label" style={{ marginBottom: 8 }}>{label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input
                        type="color"
                        value={val(key) || '#6366f1'}
                        onChange={e => set(key, e.target.value)}
                        style={{ width: 40, height: 36, padding: 2, borderRadius: 8, cursor: 'pointer', border: '1px solid var(--color-border)', background: 'transparent' }}
                      />
                      <input
                        value={val(key)}
                        onChange={e => set(key, e.target.value)}
                        placeholder="#6366f1"
                        style={{ fontSize: 13, fontFamily: 'monospace' }}
                      />
                    </div>
                    <div className="form-hint" style={{ marginTop: 6 }}>{hint}</div>
                  </div>
                ))}
              </div>

              <div className="divider" />
              <SectionTitle>Quick Theme Presets</SectionTitle>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {[
                  { name: 'Purple (Default)', primary: '#6366f1', secondary: '#8b5cf6', accent: '#06b6d4', bg: '#0f0f1a', card: '#1a1a2e' },
                  { name: 'Red & Black', primary: '#ef4444', secondary: '#dc2626', accent: '#f97316', bg: '#0f0a0a', card: '#1a0f0f' },
                  { name: 'Green Matrix', primary: '#10b981', secondary: '#059669', accent: '#34d399', bg: '#050f0a', card: '#0a1a12' },
                  { name: 'Blue Ocean', primary: '#3b82f6', secondary: '#2563eb', accent: '#06b6d4', bg: '#050a14', card: '#0a1428' },
                  { name: 'Gold Rush', primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24', bg: '#0f0d05', card: '#1a1605' },
                  { name: 'Pink Neon', primary: '#ec4899', secondary: '#db2777', accent: '#f0abfc', bg: '#0f050f', card: '#1a0a1a' },
                ].map(preset => (
                  <button key={preset.name}
                    onClick={() => {
                      set('primary_color', preset.primary)
                      set('secondary_color', preset.secondary)
                      set('accent_color', preset.accent)
                      set('background_dark', preset.bg)
                      set('background_card', preset.card)
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                      borderRadius: 10, border: '1px solid var(--color-border)', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.04)', fontFamily: 'inherit', fontSize: 13, color: 'var(--color-text)'
                    }}>
                    <div style={{ display: 'flex', gap: 3 }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: preset.primary, display: 'inline-block' }} />
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: preset.secondary, display: 'inline-block' }} />
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: preset.accent, display: 'inline-block' }} />
                    </div>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TICKER & BANNER */}
          {tab === 'ticker' && (
            <div>
              <SectionTitle>Announcement Ticker</SectionTitle>
              <Toggle label="Show Ticker Bar" hint="The scrolling announcement bar at the top" value={val('ticker_enabled') === 'true'} onChange={v => set('ticker_enabled', String(v))} />
              <FG label="Ticker Text" hint="Use · to separate messages">
                <textarea rows={3} value={val('ticker_text')} onChange={e => set('ticker_text', e.target.value)} placeholder="🎮 New items weekly · 🔥 Flash sales daily" />
              </FG>

              <div className="divider" />
              <SectionTitle>Hero Banner</SectionTitle>
              <FG label="Banner Background Image URL" hint="Leave empty for animated gradient">
                <input value={val('banner_url')} onChange={e => set('banner_url', e.target.value)} placeholder="https://yourcdn.com/banner.jpg" />
              </FG>
              <FG label="Headline">
                <input value={val('banner_headline')} onChange={e => set('banner_headline', e.target.value)} placeholder="The #1 Roblox Shop" />
              </FG>
              <FG label="Subtext">
                <textarea rows={2} value={val('banner_subtext')} onChange={e => set('banner_subtext', e.target.value)} placeholder="Top-tier game passes, items and accessories" />
              </FG>
              <FG label="CTA Button Text">
                <input value={val('hero_cta_text')} onChange={e => set('hero_cta_text', e.target.value)} placeholder="Shop Now" />
              </FG>
            </div>
          )}

          {/* PAYMENTS */}
          {tab === 'payments' && (
            <div>
              <SectionTitle>Accepted Payment Methods</SectionTitle>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>Enable the payment options shown at checkout</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { key: 'paypal', label: 'PayPal', icon: '💰', desc: 'Accept PayPal payments' },
                  { key: 'stripe', label: 'Stripe (Card)', icon: '💳', desc: 'Credit & debit cards via Stripe' },
                  { key: 'crypto', label: 'Cryptocurrency', icon: '₿', desc: 'BTC, ETH, USDT and more' },
                  { key: 'bank', label: 'Bank Transfer', icon: '🏦', desc: 'Manual bank transfer' },
                  { key: 'cashapp', label: 'CashApp', icon: '💚', desc: 'CashApp payments' },
                  { key: 'venmo', label: 'Venmo', icon: '🔵', desc: 'Venmo payments' },
                ].map(({ key, label, icon, desc }) => (
                  <label key={key} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${paymentMethods.includes(key) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: paymentMethods.includes(key) ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)',
                    transition: 'var(--transition)'
                  }}>
                    <input type="checkbox" checked={paymentMethods.includes(key)} onChange={() => togglePayment(key)} style={{ width: 'auto', accentColor: 'var(--color-primary)' }} />
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="divider" />
              <SectionTitle>PayPal Configuration</SectionTitle>
              <FG label="PayPal Email" hint="Your PayPal email for receiving payments">
                <input type="email" value={val('paypal_email')} onChange={e => set('paypal_email', e.target.value)} placeholder="payments@yourshop.com" />
              </FG>

              <div className="divider" />
              <SectionTitle>Stripe Configuration</SectionTitle>
              <FG label="Stripe Public Key" hint="Get from Stripe Dashboard → API Keys">
                <input value={val('stripe_public_key')} onChange={e => set('stripe_public_key', e.target.value)} placeholder="pk_live_..." />
              </FG>
            </div>
          )}

          {/* EMAIL */}
          {tab === 'email' && (
            <div>
              <SectionTitle>Email Notifications</SectionTitle>
              <div style={{ padding: 16, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 12, marginBottom: 24, fontSize: 13, lineHeight: 1.7 }}>
                <strong>Setup with EmailJS (free):</strong><br />
                1. Go to <a href="https://emailjs.com" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent)' }}>emailjs.com</a> → create account → add email service<br />
                2. Create an email template with variables: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 4px', borderRadius: 4 }}>{'{{to_name}}'}</code>, <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 4px', borderRadius: 4 }}>{'{{order_number}}'}</code>, <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 4px', borderRadius: 4 }}>{'{{items_list}}'}</code>, <code style={{ background: 'rgba(0,0,0,0.2)', padding: '1px 4px', borderRadius: 4 }}>{'{{total}}'}</code><br />
                3. Copy your Service ID, Template ID, and Public Key below
              </div>
              <FG label="EmailJS Service ID">
                <input value={val('emailjs_service_id')} onChange={e => set('emailjs_service_id', e.target.value)} placeholder="service_xxxxxxx" />
              </FG>
              <FG label="EmailJS Template ID">
                <input value={val('emailjs_template_id')} onChange={e => set('emailjs_template_id', e.target.value)} placeholder="template_xxxxxxx" />
              </FG>
              <FG label="EmailJS Public Key">
                <input value={val('emailjs_public_key')} onChange={e => set('emailjs_public_key', e.target.value)} placeholder="xxxxxxxxxxxxxx" />
              </FG>
              <div className="divider" />
              <FG label="Admin Email" hint="Receive a copy of every order">
                <input type="email" value={val('admin_email')} onChange={e => set('admin_email', e.target.value)} placeholder="admin@yourshop.com" />
              </FG>
            </div>
          )}

          {/* SOCIAL */}
          {tab === 'social' && (
            <div>
              <SectionTitle>Social Links</SectionTitle>
              <FG label="Discord Server URL">
                <input value={val('social_discord')} onChange={e => set('social_discord', e.target.value)} placeholder="https://discord.gg/..." />
              </FG>
              <FG label="Twitter / X URL">
                <input value={val('social_twitter')} onChange={e => set('social_twitter', e.target.value)} placeholder="https://twitter.com/..." />
              </FG>
              <FG label="YouTube Channel URL">
                <input value={val('social_youtube')} onChange={e => set('social_youtube', e.target.value)} placeholder="https://youtube.com/..." />
              </FG>
            </div>
          )}

          {/* Save button at bottom */}
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={save} disabled={saving || !hasChanges}>
              {saving ? <div className="spinner spinner-sm" /> : <><Save size={15} /> {hasChanges ? 'Save Changes' : 'No Changes'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h4 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, marginTop: 4 }}>{children}</h4>
}
function FG({ label, hint, children }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  )
}
function Toggle({ label, hint, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--color-border)', marginBottom: 16 }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{hint}</div>}
      </div>
      <button onClick={() => onChange(!value)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: value ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
        {value ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
      </button>
    </div>
  )
}
