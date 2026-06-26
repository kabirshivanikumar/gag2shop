import { useState, useEffect } from 'react'
import { Search, X, ChevronDown, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../context/SettingsContext'
import { useToast } from '../components/ui/Toast'

const STATUSES = ['pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded']
const STATUS_COLORS = {
  pending: 'var(--color-warning)',
  paid: 'var(--color-success)',
  processing: 'var(--color-primary)',
  completed: 'var(--color-success)',
  cancelled: 'var(--color-danger)',
  refunded: 'var(--color-text-muted)',
}

export default function AdminOrders() {
  const { get } = useSettings()
  const toast = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selected, setSelected] = useState(null)
  const currency = get('currency_symbol', '$')

  useEffect(() => { fetchOrders() }, [filterStatus])

  async function fetchOrders() {
    setLoading(true)
    let q = supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (filterStatus) q = q.eq('status', filterStatus)
    const { data } = await q
    setOrders(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    setOrders(os => os.map(o => o.id === id ? { ...o, status } : o))
    if (selected?.id === id) setSelected(s => ({ ...s, status }))
    toast.success(`Order status → ${status}`)
  }

  const filtered = orders.filter(o =>
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.roblox_username?.toLowerCase().includes(search.toLowerCase()) ||
    o.guest_email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order #, Roblox name, email..." style={{ paddingLeft: 36 }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <button className="btn btn-secondary" onClick={fetchOrders}><RefreshCw size={15} /></button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUSES.map(s => {
          const count = orders.filter(o => o.status === s).length
          if (!count) return null
          return (
            <button key={s} onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
              style={{ padding: '5px 12px', borderRadius: 999, border: `1px solid ${filterStatus === s ? STATUS_COLORS[s] : 'var(--color-border)'}`, background: filterStatus === s ? `${STATUS_COLORS[s]}20` : 'transparent', color: STATUS_COLORS[s], fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              {s} ({count})
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Roblox</th>
                  <th>Email</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}><div className="spinner spinner-md" style={{ margin: '0 auto' }} /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-muted)' }}>No orders found</td></tr>
                ) : filtered.map(order => (
                  <tr key={order.id} onClick={() => setSelected(selected?.id === order.id ? null : order)} style={{ cursor: 'pointer', background: selected?.id === order.id ? 'rgba(99,102,241,0.08)' : '' }}>
                    <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-primary)' }}>{order.order_number}</span></td>
                    <td style={{ fontSize: 13 }}>{order.roblox_username || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{order.guest_email || '—'}</td>
                    <td style={{ fontSize: 13 }}>{order.items?.length || 0}</td>
                    <td style={{ fontWeight: 700 }}>{currency}{Number(order.total).toFixed(2)}</td>
                    <td style={{ fontSize: 12, textTransform: 'capitalize' }}>{order.payment_method || '—'}</td>
                    <td>
                      <select value={order.status} onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value) }}
                        onClick={e => e.stopPropagation()}
                        style={{ width: 'auto', padding: '4px 8px', fontSize: 12, color: STATUS_COLORS[order.status], fontWeight: 600, background: `${STATUS_COLORS[order.status]}15`, border: `1px solid ${STATUS_COLORS[order.status]}40`, borderRadius: 6 }}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Detail */}
        {selected && (
          <div className="card" style={{ padding: 24, position: 'sticky', top: 80, maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h4 style={{ fontWeight: 700 }}>Order Detail</h4>
              <button className="btn btn-ghost" onClick={() => setSelected(null)}><X size={16} /></button>
            </div>

            <InfoRow label="Order #" value={<span style={{ fontFamily: 'monospace', color: 'var(--color-primary)' }}>{selected.order_number}</span>} />
            <InfoRow label="Status">
              <select value={selected.status} onChange={e => updateStatus(selected.id, e.target.value)}
                style={{ width: 'auto', padding: '4px 8px', fontSize: 13, color: STATUS_COLORS[selected.status], fontWeight: 600 }}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </InfoRow>
            <InfoRow label="Date" value={new Date(selected.created_at).toLocaleString()} />
            <InfoRow label="Roblox" value={selected.roblox_username || '—'} />
            <InfoRow label="Email" value={selected.guest_email || '—'} />
            <InfoRow label="Payment" value={selected.payment_method} />

            <div className="divider" />
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Items</div>
            {selected.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{item.name}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>x{item.quantity}</div>
                </div>
                <span style={{ fontWeight: 700 }}>{currency}{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <div className="divider" />
            <InfoRow label="Subtotal" value={`${currency}${Number(selected.subtotal).toFixed(2)}`} />
            {selected.tax > 0 && <InfoRow label="Tax" value={`${currency}${Number(selected.tax).toFixed(2)}`} />}
            <InfoRow label="Total" value={<strong style={{ color: 'var(--color-primary)', fontSize: 16 }}>{currency}{Number(selected.total).toFixed(2)}</strong>} />

            {selected.notes && (
              <>
                <div className="divider" />
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}><strong>Notes:</strong> {selected.notes}</div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value, children }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, fontSize: 13 }}>
      <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
      {children || <span>{value}</span>}
    </div>
  )
}
