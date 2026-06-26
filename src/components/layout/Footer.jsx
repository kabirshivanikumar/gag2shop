import { Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'

const SUPPORT_EMAIL = 'support@voidenterprises.xyz'

export default function Footer() {
  const { get } = useSettings()
  const siteName = get('site_name', 'VoidEnterprises')
  const footerText = get('footer_text', `© ${new Date().getFullYear()} VoidEnterprises. All rights reserved.`)
  const discord = get('social_discord', '')
  const twitter = get('social_twitter', '')
  const youtube = get('social_youtube', '')
  const tagline = get('site_tagline', 'Premium Roblox Items & Game Passes')

  return (
    <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border)', background: 'rgba(10,10,18,0.95)', backdropFilter: 'blur(12px)', position: 'relative', zIndex: 1 }}>
      <div className="container" style={{ padding: '48px 24px 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 36, marginBottom: 36 }}>

          {/* Brand */}
          <div style={{ minWidth: 170 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, marginBottom: 10 }}>
              <span className="gradient-text">{siteName}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: 16, maxWidth: 200 }}>{tagline}</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--color-primary)', marginBottom: 16, textDecoration: 'none', fontWeight: 500 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              {SUPPORT_EMAIL}
            </a>
            <div style={{ display: 'flex', gap: 8 }}>
              {discord && <SocialLink href={discord} label="Discord" hoverColor="#5865F2"><DiscordIcon /></SocialLink>}
              {twitter && <SocialLink href={twitter} label="Twitter"><TwitterIcon /></SocialLink>}
              {youtube && <SocialLink href={youtube} label="YouTube" hoverColor="#FF0000"><YouTubeIcon /></SocialLink>}
            </div>
          </div>

          {/* Shop */}
          <div>
            <FH>Shop</FH>
            <FL to="/shop">All Products</FL>
            <FL to="/shop?featured=true">⭐ Featured</FL>
            <FL to="/shop?category=game-passes">Game Passes</FL>
            <FL to="/shop?category=robux">Robux</FL>
            <FL to="/shop?category=ugc-items">UGC Items</FL>
          </div>

          {/* Account */}
          <div>
            <FH>Account</FH>
            <FL to="/auth">Sign In / Sign Up</FL>
            <FL to="/profile">My Profile</FL>
            <FL to="/orders">My Orders</FL>
            <FL to="/checkout">Checkout</FL>
          </div>

          {/* Support */}
          <div>
            <FH>Support</FH>
            <FL to="/contact">Contact Us</FL>
            <FE href={`mailto:${SUPPORT_EMAIL}`}>Email Support</FE>
            {discord && <FE href={discord}>Discord Server</FE>}
            <FL to="/orders">Track Order</FL>
          </div>

          {/* Legal */}
          <div>
            <FH>Legal</FH>
            <FL to="/terms">Terms of Service</FL>
            <FL to="/privacy">Privacy Policy</FL>
            <FL to="/contact">Refund Policy</FL>
          </div>
        </div>

        {/* Trust strip */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', padding: '18px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', marginBottom: 20 }}>
          {['⚡ Instant Delivery','🔒 Secure Checkout','🌟 5-Star Rated','💬 24/7 Support','🔄 Refund Policy'].map(item => (
            <div key={item} style={{ fontSize: 12, color: 'var(--color-text-muted)', padding: '5px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--color-border)', borderRadius: 999 }}>{item}</div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{footerText}</span>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <FL to="/terms" inline>Terms</FL>
            <FL to="/privacy" inline>Privacy</FL>
            <FL to="/contact" inline>Contact</FL>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>Not affiliated with Roblox Corp.</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FH({ children }) {
  return <h4 style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 14, color: 'rgba(255,255,255,0.45)' }}>{children}</h4>
}
function FL({ to, children, inline }) {
  const base = { fontSize: inline ? 12 : 14, color: 'var(--color-text-muted)', marginBottom: inline ? 0 : 9, transition: 'var(--transition)', display: inline ? 'inline' : 'block' }
  return (
    <Link to={to} style={base}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text)'; if (!inline) e.currentTarget.style.paddingLeft = '4px' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; if (!inline) e.currentTarget.style.paddingLeft = '0' }}
    >{children}</Link>
  )
}
function FE({ href, children }) {
  return (
    <a href={href} target={href.startsWith('mailto') ? '_self' : '_blank'} rel="noreferrer"
      style={{ display: 'block', fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 9, transition: 'var(--transition)' }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.paddingLeft = '4px' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.paddingLeft = '0' }}
    >{children}</a>
  )
}
function SocialLink({ href, label, children, hoverColor }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label}
      style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', transition: 'var(--transition)' }}
      onMouseEnter={e => { e.currentTarget.style.color = hoverColor || 'var(--color-text)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
    >{children}</a>
  )
}
function DiscordIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.079.114 18.1.135 18.11a19.916 19.916 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 13.944 13.944 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.14 13.14 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg> }
function TwitterIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> }
function YouTubeIcon() { return <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg> }
