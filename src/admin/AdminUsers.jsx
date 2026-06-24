import { useState, useEffect } from 'react'
import { Search, Shield, User, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/ui/Toast'
import { useAuth } from '../context/AuthContext'

export default function AdminUsers() {
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  async function toggleRole(id, currentRole) {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin'
    if (id === currentUser.id && newRole !== 'admin') {
      if (!confirm('Remove your own admin access? You will be locked out of the admin panel.')) return
    }
    await supabase.from('profiles').update({ role: newRole }).eq('id', id)
    setUsers(us => us.map(u => u.id === id ? { ...u, role: newRole } : u))
    toast.success(`User role → ${newRole}`)
  }

  // FIXED: Filter checks email and full_name instead of missing username fields
  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.roblox_user_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." style={{ paddingLeft: 36 }} />
        </div>
        <button className="btn btn-secondary" onClick={fetchUsers}><RefreshCw size={15} /></button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Roblox ID / Details</th>
                <th>Role</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner spinner-md" style={{ margin: '0 auto' }} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No users found</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700, flexShrink: 0
                      }}>
                        {/* FIXED: Safe fallback character lookup */}
                        {(u.full_name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        {/* FIXED: Uses full_name and email columns from your database */}
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{u.full_name || 'No Name Added'}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  {/* FIXED: Maps to your roblox_user_id column */}
                  <td style={{ fontSize: 13 }}>{u.roblox_user_id ? `ID: ${u.roblox_user_id}` : '—'}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                      background: u.role === 'admin' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)',
                      color: u.role === 'admin' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      border: `1px solid ${u.role === 'admin' ? 'rgba(99,102,241,0.3)' : 'var(--color-border)'}`
                    }}>
                      {u.role === 'admin' ? <Shield size={11} /> : <User size={11} />}
                      {u.role || 'customer'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className={`btn btn-sm ${u.role === 'admin' ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={() => toggleRole(u.id, u.role)}
                        title={u.role === 'admin' ? 'Remove admin' : 'Make admin'}
                      >
                        {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 13, color: 'var(--color-text-muted)' }}>
        {filtered.length} users · {users.filter(u => u.role === 'admin').length} admins
      </div>
    </div>
  )
}
