import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: <Clock size={14} />, color: 'var(--color-warning)' },
  paid: { label: 'Paid', icon: <CheckCircle size={14} />, color: 'var(--color-success)' },
  processing: { label: 'Processing', icon: <AlertCircle size={14} />, color: 'var(--color-primary)' },
  completed: { label: 'Completed', icon: <CheckCircle size={14} />, color: 'var(--color-success)' },
  cancelled: { label: 'Cancelled', icon: <XCircle size={14} />, color: 'var(--color-danger)' },
}

export default function OrdersPage() {
  const { user } = useAuth()
  const { get } = useSettings()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const currency = get('currency_symbol', '$')

  useEffect(() => {
    if (!user) { navigate('/auth'); return }
    fetchOrders()
  }, [user])

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner spinner-lg" style={{ margin: '0 auto' }} /></div>

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>My Orders</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>{orders.length} orders</p>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <Package size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ marginBottom: 8 }}>No orders yet</h3>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>Start Shopping</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
            return (
              <div key={order.id} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{order.order_number}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: status.color, fontSize: 13, fontWeight: 600 }}>
                        {status.icon} {status.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                      {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      · {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                      · {order.payment_method}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--color-primary)' }}>
                    {currency}{Number(order.total).toFixed(2)}
                  </div>
                </div>

                {/* Items preview */}
                <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {order.items?.slice(0, 4).map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 8, fontSize: 13 }}>
                      {item.image_url && <img src={item.image_url} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />}
                      <span>{item.name}</span>
                      <span style={{ color: 'var(--color-text-muted)' }}>x{item.quantity}</span>
                    </div>
                  ))}
                  {order.items?.length > 4 && (
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)', padding: '6px 12px' }}>+{order.items.length - 4} more</span>
                  )}
                </div>

                {order.roblox_username && (
                  <div style={{ marginTop: 12, fontSize: 13, color: 'var(--color-text-muted)' }}>
                    Roblox: <strong style={{ color: 'var(--color-text)' }}>{order.roblox_username}</strong>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
