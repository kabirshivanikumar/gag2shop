import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

export default function PrivacyPage() {
  const { get } = useSettings()
  const siteName = get('site_name', 'VoidEnterprises')
  const supportEmail = 'support@voidenterprises.xyz'
  const updated = 'June 2025'

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6,182,212,0.10) 0%, rgba(99,102,241,0.08) 100%)',
        borderBottom: '1px solid var(--color-border)',
        padding: '56px 24px 48px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: 12 }}>
          Privacy Policy
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15, maxWidth: 520, margin: '0 auto' }}>
          Your privacy matters. Here's exactly what data we collect, how we use it, and how we protect it.
        </p>
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>Last updated: {updated}</div>
      </div>

      {/* Quick summary cards */}
      <div className="container" style={{ padding: '40px 24px 0', maxWidth: 800 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 48 }}>
          {[
            { icon: '📧', title: 'Email Only', desc: 'We only collect what\'s needed to fulfil your order' },
            { icon: '🚫', title: 'Never Sold', desc: 'Your data is never sold to third parties' },
            { icon: '🔐', title: 'Encrypted', desc: 'All data is stored securely via Supabase' },
            { icon: '🗑️', title: 'Deletable', desc: 'Request deletion anytime by emailing us' },
          ].map(c => (
            <div key={c.title} style={{ padding: '18px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="container" style={{ padding: '0 24px 48px', maxWidth: 800 }}>
        <style>{`
          .privacy-content ul { padding-left: 20px; margin: 10px 0; }
          .privacy-content li { margin-bottom: 8px; color: var(--color-text-muted); font-size: 15px; line-height: 1.7; }
          .privacy-content strong { color: var(--color-text); }
          .privacy-content a { color: var(--color-primary); }
        `}</style>
        <div className="privacy-content">

          <PS n="1" title="Who We Are">
            {siteName} ("we", "us", "our") operates at voidenterprises.xyz. We are the data controller responsible for your personal information. Contact us at <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
          </PS>

          <PS n="2" title="What Data We Collect">
            We collect only what is necessary to operate our service:
            <ul>
              <li><strong>Account data:</strong> Email address, display name, and password (hashed — we never see it in plain text)</li>
              <li><strong>Order data:</strong> Name, email, Roblox username, items purchased, payment method chosen, and order notes</li>
              <li><strong>Usage data:</strong> Pages visited, browser type, and approximate location (via anonymised IP) for security purposes only</li>
              <li><strong>Communications:</strong> Any messages you send us via email or our contact form</li>
            </ul>
            We do <strong>not</strong> collect or store credit card numbers or bank details. Payments are processed by third-party providers (PayPal, Stripe) under their own privacy policies.
          </PS>

          <PS n="3" title="How We Use Your Data">
            <ul>
              <li>To process and fulfil your orders</li>
              <li>To send order confirmation and delivery emails</li>
              <li>To respond to support requests</li>
              <li>To prevent fraud and maintain security</li>
              <li>To improve our products and services (aggregated, anonymised analytics only)</li>
              <li>To comply with legal obligations</li>
            </ul>
            We will <strong>never</strong> use your data for unsolicited marketing without your explicit consent.
          </PS>

          <PS n="4" title="Legal Basis for Processing">
            We process your data under the following lawful bases:
            <ul>
              <li><strong>Contract:</strong> Processing necessary to fulfil your order</li>
              <li><strong>Legitimate interests:</strong> Fraud prevention and security</li>
              <li><strong>Legal obligation:</strong> Compliance with applicable laws</li>
              <li><strong>Consent:</strong> For any optional communications you opt into</li>
            </ul>
          </PS>

          <PS n="5" title="Data Storage & Security">
            All personal data is stored in Supabase (a secure cloud database) with encryption at rest and in transit. Access is protected by Row Level Security — meaning your data can only be accessed by you and authorised administrators. We implement industry-standard security practices and regularly review our systems.
          </PS>

          <PS n="6" title="Third-Party Services">
            We use the following third-party services which may process your data:
            <ul>
              <li><strong>Supabase</strong> — Database and authentication (supabase.com/privacy)</li>
              <li><strong>PayPal</strong> — Payment processing (paypal.com/privacy)</li>
              <li><strong>Stripe</strong> — Payment processing (stripe.com/privacy)</li>
              <li><strong>EmailJS</strong> — Transactional email delivery (emailjs.com/legal/privacy-policy)</li>
              <li><strong>Vercel</strong> — Website hosting (vercel.com/legal/privacy-policy)</li>
            </ul>
            Each of these providers is contractually obligated to protect your data and may not use it for their own purposes.
          </PS>

          <PS n="7" title="Data Retention">
            We retain your data for as long as your account is active or as needed to provide services. Order records are kept for up to 3 years for legal and tax purposes. You may request earlier deletion (see Your Rights below).
          </PS>

          <PS n="8" title="Cookies">
            We use essential cookies only:
            <ul>
              <li><strong>Authentication cookie:</strong> Keeps you logged in (expires when you sign out)</li>
              <li><strong>Cart cookie:</strong> Remembers your cart contents (localStorage, not a cookie)</li>
            </ul>
            We do not use advertising, tracking, or analytics cookies.
          </PS>

          <PS n="9" title="Your Rights">
            You have the right to:
            <ul>
              <li><strong>Access</strong> — Request a copy of all data we hold about you</li>
              <li><strong>Correction</strong> — Update inaccurate data via your profile page</li>
              <li><strong>Deletion</strong> — Request complete removal of your account and data</li>
              <li><strong>Portability</strong> — Receive your data in a machine-readable format</li>
              <li><strong>Objection</strong> — Object to processing based on legitimate interests</li>
              <li><strong>Restriction</strong> — Request we limit processing in certain circumstances</li>
            </ul>
            To exercise any right, email <a href={`mailto:${supportEmail}`}>{supportEmail}</a>. We will respond within 30 days.
          </PS>

          <PS n="10" title="Children's Privacy">
            {siteName} is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us personal information, contact us immediately and we will delete it.
          </PS>

          <PS n="11" title="Changes to This Policy">
            We may update this Privacy Policy from time to time. Material changes will be communicated via email or a prominent notice on the Site. The date at the top of this page always reflects when it was last updated.
          </PS>

          <PS n="12" title="Contact & Complaints">
            For privacy questions: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
            <br /><br />
            If you believe we have not handled your data correctly, you have the right to lodge a complaint with your local data protection authority.
          </PS>

        </div>

        {/* Bottom nav */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--color-border)' }}>
          <Link to="/terms" className="btn btn-secondary btn-sm">Terms of Service</Link>
          <Link to="/contact" className="btn btn-secondary btn-sm">Contact Us</Link>
          <Link to="/shop" className="btn btn-primary btn-sm">Back to Shop</Link>
        </div>
      </div>
    </div>
  )
}

function PS({ n, title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
        marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800, color: '#fff'
        }}>{n}</span>
        {title}
      </h2>
      <div style={{ color: 'var(--color-text-muted)', fontSize: 15, lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  )
}
