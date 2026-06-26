import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

export default function TermsPage() {
  const { get } = useSettings()
  const navigate = useNavigate()

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')} style={{ marginBottom: 20 }}>
        &larr; Back to Home
      </button>
      
      <div className="card" style={{ padding: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 24 }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, lineHeight: 1.6, fontSize: 15 }}>
          <section>
            <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--color-primary)' }}>1. Agreement to Terms</h3>
            <p>By accessing {get('site_name', 'our shop')}, you agree to be bound by these Terms of Service. If you do not agree, please do not use the site.</p>
          </section>

          <section>
            <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--color-primary)' }}>2. Roblox Virtual Items</h3>
            <p>All items sold on this platform are virtual goods used exclusively within Roblox. We are not officially affiliated with Roblox Corporation. All sales are final once delivery is completed to your specified Roblox username.</p>
          </section>

          <section>
            <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--color-primary)' }}>3. Payment & Verification</h3>
            <p>For custom payment methods, orders will remain "On Hold" until a valid payment screenshot proof is uploaded and manually verified by our staff. Fraudulent or forged screenshots will result in an immediate permanent ban.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
