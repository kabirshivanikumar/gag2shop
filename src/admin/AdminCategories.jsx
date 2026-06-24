import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, GripVertical } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/ui/Toast'

const EMPTY = { name: '', slug: '', description: '', image_url: '', display_order: 0 }

export default function AdminCategories() {
  const toast = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchCats() }, [])

  async function fetchCats() {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('display_order')
    setCategories(data || [])
    setLoading(false)
  }

  function toSlug(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function openAdd() { setForm(EMPTY); setModal('add') }
  function openEdit(c) { setForm(c); setModal('edit') }

  async function save() {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      const payload = { ...form, slug: form.slug || toSlug(form.name) }
      if (modal === 'add') {
        delete payload.id
        const { error } = await supabase.from('categories').insert(payload)
        if (error) throw error
        toast.success('Category created!')
      } else {
        const { error } = await supabase.from('categories').update(payload).eq('id', form.id)
        if (error) throw error
        toast.success('Category updated!')
      }
      setModal(null)
      fetchCats()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  async function deleteCategory(id) {
    if (!confirm('Delete this category? Products will be uncategorized.')) return
    await supabase.from('categories').delete().eq('id', id)
    toast.success('Deleted')
    fetchCats()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Category</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner spinner-lg" style={{ margin: '0 auto' }} /></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {categories.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--color-text-muted)' }}>No categories yet</div>
          )}
          {categories.map(cat => (
            <div key={cat.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <GripVertical size={16} color="var(--color-text-muted)" style={{ flexShrink: 0, cursor: 'grab' }} />
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(99,102,241,0.1)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cat.image_url
                  ? <img src={cat.image_url} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 20 }}>🎮</span>
                }
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{cat.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>/{cat.slug} · Order: {cat.display_order}</div>
                {cat.description && <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{cat.description}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(cat)}><Pencil size={13} /></button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteCategory(cat.id)}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700 }}>{modal === 'add' ? 'Add Category' : 'Edit Category'}</h3>
              <button className="btn btn-ghost" onClick={() => setModal(null)}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label className="form-label">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) }))} placeholder="Game Passes" />
            </div>
            <div className="form-group">
              <label className="form-label">Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="game-passes" />
              <div className="form-hint">URL-friendly name (auto-generated from name)</div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Category description..." />
            </div>
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input type="number" value={form.display_order} onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) }))} />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? <div className="spinner spinner-sm" /> : modal === 'add' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
