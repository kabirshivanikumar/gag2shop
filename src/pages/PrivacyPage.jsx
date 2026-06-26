import { useNavigate } from 'react-router-dom'
import { useSettings } from '../context/SettingsContext'

export default function PrivacyPage() {
  const { get } = useSettings()
  const navigate = useNavigate()

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: 800, margin: '0 auto' }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')} style={{ marginBottom: 20 }}>
        &larr; Back to Home
      </button>
      
      <div className="card" style={{ padding: 40 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 24 }}>Last updated: {new Date().toLocaleDateString()}</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, lineHeight: 1.6, fontSize: 15 }}>
          <section>
            <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--color-primary)' }}>1. Information We Collect</h3>
            <p>We collect minimal information necessary to fulfill your virtual orders. This includes your email address, billing preferences, and the Roblox username you provide during checkout to receive your items.</p>
          </section>

          <section>
            <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--color-primary)' }}>2. How We Use Your Data</h3>
            <p>Your details are strictly used to process your transactions, deliver your items safely in-game, and send order updates or receipt confirmations. We do not sell, rent, or distribute your information to third-party advertisers.</p>
          </section>

          <section>
            <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--color-primary)' }}>3. Payment Processing & Proofs</h3>
            <p>All verification records, including custom payment screenshots or transaction proofs, are securely managed within our private cloud storage platform. This transactional media is viewed exclusively by approved store administrators to verify payments and prevent fraudulent chargeback activities.</p>
          </section>

          <section>
            <h3 style={{ fontWeight: 700, marginBottom: 8, color: 'var(--color-primary)' }}>4. Security</h3>
            <p>We employ modern industry security measures to maintain the safety of your personal information when you place an order or access your account details.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
