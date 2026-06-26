import { Link } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

export default function TermsPage() {
  const { get } = useSettings()
  const siteName = get('site_name', 'VoidEnterprises')
  const supportEmail = 'support@voidenterprises.xyz'
  const updated = 'June 2025'

  return (
    <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
        borderBottom: '1px solid var(--color-border)',
        padding: '56px 24px 48px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, marginBottom: 12 }}>
          Terms of Service
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 15, maxWidth: 520, margin: '0 auto' }}>
          Please read these terms carefully before using {siteName}. By placing an order you agree to be bound by them.
        </p>
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>Last updated: {updated}</div>
      </div>

      {/* Content */}
      <div className="container" style={{ padding: '48px 24px', maxWidth: 800 }}>
        <LegalDoc>

          <Section n="1" title="Acceptance of Terms">
            By accessing or using {siteName} ("the Site", "we", "us", "our"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Site. We reserve the right to update these terms at any time; continued use constitutes acceptance of any changes.
          </Section>

          <Section n="2" title="Products & Digital Goods">
            All items sold on {siteName} are digital goods related to the Roblox platform, including but not limited to game passes, in-game items, scripts, and Robux-related services. {siteName} is an independent reseller and is <strong>not affiliated with, endorsed by, or officially connected to Roblox Corporation</strong>.
          </Section>

          <Section n="3" title="Eligibility">
            You must be at least 13 years of age to use this Site. If you are under 18, you confirm you have parental or guardian consent to make purchases. We reserve the right to refuse service to anyone for any reason.
          </Section>

          <Section n="4" title="Orders & Payment">
            <ul>
              <li>All prices are listed in the currency shown and are subject to change without notice.</li>
              <li>Orders are confirmed only after payment is verified by our team.</li>
              <li>We reserve the right to cancel any order at our discretion and issue a full refund.</li>
              <li>You are responsible for providing an accurate Roblox username at checkout. Orders delivered to an incorrect username due to customer error are non-refundable.</li>
              <li>Payment must be completed within 24 hours of placing an order, or the order may be cancelled.</li>
            </ul>
          </Section>

          <Section n="5" title="Delivery">
            Digital items are typically delivered within the timeframe stated on the product page. Delivery times are estimates and not guaranteed. We are not liable for delays caused by Roblox platform issues, maintenance, or downtime.
          </Section>

          <Section n="6" title="Refund Policy">
            <ul>
              <li><strong>Delivered orders:</strong> No refunds once a digital item has been delivered to your Roblox account.</li>
              <li><strong>Undelivered orders:</strong> If we are unable to fulfil your order within 72 hours, you are entitled to a full refund.</li>
              <li><strong>Wrong item delivered:</strong> Contact us within 24 hours and we will correct the error or issue a refund.</li>
              <li><strong>Chargebacks:</strong> Initiating a chargeback without first contacting us may result in a permanent account ban.</li>
            </ul>
            To request a refund, email <a href={`mailto:${supportEmail}`} style={{ color: 'var(--color-primary)' }}>{supportEmail}</a>.
          </Section>

          <Section n="7" title="Prohibited Conduct">
            You agree not to:
            <ul>
              <li>Use the Site for any unlawful purpose or in violation of Roblox's Terms of Service.</li>
              <li>Attempt to gain unauthorised access to any part of the Site or our systems.</li>
              <li>Resell items purchased from {siteName} without our express written consent.</li>
              <li>Provide false information when creating an account or placing an order.</li>
              <li>Harass, abuse, or threaten our staff or other customers.</li>
            </ul>
          </Section>

          <Section n="8" title="Intellectual Property">
            All content on this Site, including logos, graphics, text, and design, is the property of {siteName} and may not be copied, reproduced, or distributed without prior written permission. Roblox and related marks are trademarks of Roblox Corporation.
          </Section>

          <Section n="9" title="Disclaimers & Limitation of Liability">
            {siteName} provides the Site and all products "as is" without warranty of any kind. To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Site or products purchased. Our total liability for any claim shall not exceed the amount paid for the relevant order.
          </Section>

          <Section n="10" title="Account Termination">
            We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason at our sole discretion, with or without notice.
          </Section>

          <Section n="11" title="Governing Law">
            These Terms shall be governed by and construed in accordance with applicable law. Any disputes shall be resolved through good-faith negotiation; if unresolved, through binding arbitration.
          </Section>

          <Section n="12" title="Contact">
            For questions about these Terms, contact us at{' '}
            <a href={`mailto:${supportEmail}`} style={{ color: 'var(--color-primary)' }}>{supportEmail}</a>
            {' '}or visit our <Link to="/contact" style={{ color: 'var(--color-primary)' }}>Contact page</Link>.
          </Section>

        </LegalDoc>

        {/* Bottom nav */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 40, paddingTop: 32, borderTop: '1px solid var(--color-border)' }}>
          <Link to="/privacy" className="btn btn-secondary btn-sm">Privacy Policy</Link>
          <Link to="/contact" className="btn btn-secondary btn-sm">Contact Us</Link>
          <Link to="/shop" className="btn btn-primary btn-sm">Back to Shop</Link>
        </div>
      </div>
    </div>
  )
}

function Section({ n, title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{
        fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
        marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
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

function LegalDoc({ children }) {
  return (
    <div style={{ '--ul-color': 'var(--color-text-muted)' }}>
      <style>{`
        .legal-content ul { padding-left: 20px; margin: 10px 0; }
        .legal-content li { margin-bottom: 8px; color: var(--color-text-muted); font-size: 15px; line-height: 1.7; }
        .legal-content strong { color: var(--color-text); }
      `}</style>
      <div className="legal-content">{children}</div>
    </div>
  )
}
