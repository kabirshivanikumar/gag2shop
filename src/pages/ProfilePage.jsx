import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Save, Package } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/ui/Toast'

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    display_name: profile?.display_name || '',
    roblox_username: profile?.roblox_username || '',
    avatar_url: profile?.avatar_url || '',
  })
  const [saving, setSaving] = useState(false)

  if (!user) { navigate('/auth'); return null }

  async function save(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await updateProfile(form)
    setSaving(false)
    if (error) toast.error(error.message)
    else toast.success('Profile updated!')
  }

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: 600 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 700
        }}>
          {form.avatar_url
            ? <img src={form.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            : (profile?.display_name || user.email)?.[0]?.toUpperCase()
          }
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700 }}>{profile?.display_name || 'My Profile'}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{user.email}</p>
        </div>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={save}>
          <div className="form-group">
            <label className="form-label">Display Name</label>
            <input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} placeholder="Your name" />
          </div>
          <div className="form-group">
            <label className="form-label">Roblox Username</label>
            <input value={form.roblox_username} onChange={e => setForm(f => ({ ...f, roblox_username: e.target.value }))} placeholder="YourRobloxName" />
            <div className="form-hint">Used for auto-filling at checkout</div>
          </div>
          <div className="form-group">
            <label className="form-label">Avatar URL</label>
            <input value={form.avatar_url} onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input value={user.email} disabled style={{ opacity: 0.5 }} />
            <div className="form-hint">Email cannot be changed here</div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <div className="spinner spinner-sm" /> : <><Save size={15} /> Save Profile</>}
          </button>
        </form>
      </div>

      <button className="btn btn-secondary" style={{ marginTop: 16, width: '100%' }} onClick={() => navigate('/orders')}>
        <Package size={15} /> View My Orders
      </button>
    </div>
  )
}
