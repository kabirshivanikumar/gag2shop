import { Link } from 'react-router-dom'
import { useSettings } from '../../context/SettingsContext'

export default function Footer() {
  const { get } = useSettings()

  const siteName = get('site_name', 'RobloxShop')
  const footerText = get('footer_text', `© ${new Date().getFullYear()} RobloxShop. All rights reserved.`)
  const discord = get('social_discord')
  const twitter = get('social_twitter')
  const youtube = get('social_youtube')

  return (
    <footer style={{
      marginTop: 'auto',
      borderTop: '1px solid var(--color-border)',
      background: 'rgba(15,15,26,0.8)',
      backdropFilter: 'blur(8px)',
      position: 'relative', zIndex: 1
    }}>
      <div className="container" style={{ padding: '40px 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, marginBottom: 32 }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 10 }}>
              <span className="gradient-text">{siteName}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              The premier destination for Roblox game passes, items, and accessories.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              {discord && <SocialLink href={discord} label="Discord">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.079.114 18.1.135 18.11a19.916 19.916 0 0 0 5.993 3.03.077.077 0 0 0 .084-.028 13.944 13.944 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.14 13.14 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
              </SocialLink>}
              {twitter && <SocialLink href={twitter} label="Twitter">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </SocialLink>}
              {youtube && <SocialLink href={youtube} label="YouTube">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </SocialLink>}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, color: 'var(--color-text-muted)' }}>Shop</h4>
            {[
              { to: '/shop', label: 'All Products' },
              { to: '/shop?featured=true', label: 'Featured' },
              { to: '/shop?category=game-passes', label: 'Game Passes' },
              { to: '/shop?category=robux', label: 'Robux' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{ display: 'block', fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 8, transition: 'var(--transition)' }}
                onMouseEnter={e => e.target.style.color = 'var(--color-text)'}
                onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}>
                {label}
              </Link>
            ))}
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, color: 'var(--color-text-muted)' }}>Account</h4>
            {[
              { to: '/auth', label: 'Sign In / Sign Up' },
              { to: '/profile', label: 'My Profile' },
              { to: '/orders', label: 'My Orders' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} style={{ display: 'block', fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 8, transition: 'var(--transition)' }}
                onMouseEnter={e => e.target.style.color = 'var(--color-text)'}
                onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}>
                {label}
              </Link>
            ))}
          </div>

          {/* Trust badges */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, color: 'var(--color-text-muted)' }}>Why Us</h4>
            {['⚡ Instant Delivery', '🔒 Secure Checkout', '🌟 5-Star Service', '💬 24/7 Support'].map(item => (
              <div key={item} style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 8 }}>{item}</div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{footerText}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Not affiliated with Roblox Corporation</span>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, label, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label}
      style={{
        width: 34, height: 34, borderRadius: 8,
        background: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-text-muted)', transition: 'var(--transition)'
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
    >{children}</a>
  )
}
