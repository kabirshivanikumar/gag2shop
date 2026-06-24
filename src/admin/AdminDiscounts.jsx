import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Copy, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../components/ui/Toast'

const EMPTY = { code: '', type: 'percent', value: '', min_order: 0, max_uses: '', is_active: true, expires_at: '' }

function randomCode() {
  return 'RBX' + Math.random().toString(36).slice(2, 7).toUpperCase()
}

export default function AdminDiscounts() {
  const { get } = useSettings()
  const toast = useToast()
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const currency = get('currency_symbol', '$')

  useEffect(() => { fetchCodes() }, [])

  async function fetchCodes() {
    setLoading(true)
    const { data } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false })
    setCodes(data || [])
    setLoading(false)
  }

  async function save() {
    if (!form.code.trim() || !form.value) { toast.error('Code and value are required'); return }
    setSaving(true)
    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        value: parseFloat(form.value),
        min_order: parseFloat(form.min_order) || 0,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        expires_at: form.expires_at || null,
      }
      delete payload.id
      const { error } = await supabase.from('discount_codes').insert(payload)
      if (error) throw error
      toast.success('Discount code created!')
      setModal(false)
      fetchCodes()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  async function deleteCode(id) {
    if (!confirm('Delete this discount code?')) return
    await supabase.from('discount_codes').delete().eq('id', id)
    toast.success('Deleted')
    fetchCodes()
  }

  async function toggleActive(id, val) {
    await supabase.from('discount_codes').update({ is_active: val }).eq('id', id)
    setCodes(cs => cs.map(c => c.id === id ? { ...c, is_active: val } : c))
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code)
    toast.success(`Copied "${code}"!`)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={() => { setForm({ ...EMPTY, code: randomCode() }); setModal(true) }}>
          <Plus size={16} /> Create Code
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner spinner-lg" style={{ margin: '0 auto' }} /></div>
      ) : codes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎫</div>
          <h3 style={{ marginBottom: 8 }}>No discount codes</h3>
          <p>Create your first coupon code above</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Uses</th>
                <th>Expires</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map(code => (
                <tr key={code.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: 'var(--color-primary)', background: 'rgba(99,102,241,0.1)', padding: '3px 8px', borderRadius: 6 }}>{code.code}</span>
                      <button onClick={() => copyCode(code.code)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 2 }}>
                        <Copy size={13} />
                      </button>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, textTransform: 'capitalize' }}>{code.type}</td>
                  <td style={{ fontWeight: 700 }}>{code.type === 'percent' ? `${code.value}%` : `${currency}${Number(code.value).toFixed(2)}`}</td>
                  <td style={{ fontSize: 13 }}>{code.min_order > 0 ? `${currency}${Number(code.min_order).toFixed(2)}` : '—'}</td>
                  <td style={{ fontSize: 13 }}>
                    {code.used_count}{code.max_uses ? `/${code.max_uses}` : ''}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    <button onClick={() => toggleActive(code.id, !code.is_active)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: code.is_active ? 'var(--color-success)' : 'var(--color-text-muted)', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600 }}>
                      {code.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {code.is_active ? 'Active' : 'Off'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteCode(code.id)}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700 }}>Create Discount Code</h3>
              <button className="btn btn-ghost" onClick={() => setModal(false)}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Code *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" />
                <button className="btn btn-secondary btn-sm" onClick={() => setForm(f => ({ ...f, code: randomCode() }))} style={{ flexShrink: 0 }}>Random</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed ({currency})</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Value *</label>
                <input type="number" min="0" step="0.01" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder={form.type === 'percent' ? '20' : '5.00'} />
              </div>
              <div className="form-group">
                <label className="form-label">Min Order ({currency})</label>
                <input type="number" min="0" step="0.01" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Max Uses</label>
                <input type="number" min="0" value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))} placeholder="Unlimited" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, marginBottom: 20 }}>
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} style={{ width: 'auto', accentColor: 'var(--color-primary)' }} />
              Active immediately
            </label>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? <div className="spinner spinner-sm" /> : 'Create Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
