import { useState, useEffect } from 'react'
import { TrendingUp, ShoppingBag, Users, Package, ArrowUpRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useSettings } from '../context/SettingsContext'

export default function AdminOverview({ onTab }) {
  const { get } = useSettings()
  const [stats, setStats] = useState({ orders: 0, revenue: 0, customers: 0, products: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const currency = get('currency_symbol', '$')

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const [ordersRes, customersRes, productsRes, recentRes] = await Promise.all([
        supabase.from('orders').select('total, status'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'customer'),
        supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      const orders = ordersRes.data || []
      const revenue = orders.filter(o => ['paid', 'completed'].includes(o.status)).reduce((sum, o) => sum + Number(o.total), 0)
      setStats({
        orders: orders.length,
        revenue,
        customers: customersRes.count || 0,
        products: productsRes.count || 0,
      })
      setRecentOrders(recentRes.data || [])
    } finally {
      setLoading(false)
    }
  }

  const STAT_CARDS = [
    { label: 'Total Revenue', value: `${currency}${stats.revenue.toFixed(2)}`, icon: <TrendingUp size={22} />, color: 'var(--color-success)', bg: 'rgba(16,185,129,0.1)' },
    { label: 'Total Orders', value: stats.orders, icon: <ShoppingBag size={22} />, color: 'var(--color-primary)', bg: 'rgba(99,102,241,0.1)', tab: 'orders' },
    { label: 'Customers', value: stats.customers, icon: <Users size={22} />, color: 'var(--color-accent)', bg: 'rgba(6,182,212,0.1)', tab: 'users' },
    { label: 'Active Products', value: stats.products, icon: <Package size={22} />, color: 'var(--color-secondary)', bg: 'rgba(139,92,246,0.1)', tab: 'products' },
  ]

  const STATUS_COLORS = {
    pending: 'var(--color-warning)',
    paid: 'var(--color-success)',
    processing: 'var(--color-primary)',
    completed: 'var(--color-success)',
    cancelled: 'var(--color-danger)',
  }

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {STAT_CARDS.map(card => (
          <div
            key={card.label}
            className="card"
            style={{ padding: 24, cursor: card.tab ? 'pointer' : 'default' }}
            onClick={() => card.tab && onTab(card.tab)}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                {card.icon}
              </div>
              {card.tab && <ArrowUpRight size={16} color="var(--color-text-muted)" />}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 4 }}>{loading ? '—' : card.value}</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700 }}>Recent Orders</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => onTab('orders')}>View All</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Roblox</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: 32 }}>No orders yet</td></tr>
              ) : recentOrders.map(order => (
                <tr key={order.id}>
                  <td><span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-primary)' }}>{order.order_number}</span></td>
                  <td style={{ fontSize: 13 }}>{order.guest_email || '—'}</td>
                  <td style={{ fontSize: 13 }}>{order.roblox_username || '—'}</td>
                  <td style={{ fontSize: 13 }}>{order.items?.length || 0}</td>
                  <td style={{ fontWeight: 700 }}>{currency}{Number(order.total).toFixed(2)}</td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: STATUS_COLORS[order.status] || 'var(--color-text-muted)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[order.status] || 'var(--color-text-muted)', display: 'inline-block' }} />
                      {order.status}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
