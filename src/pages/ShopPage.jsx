import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/shop/ProductCard'

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState('sort_order')
  // local search so user can type without triggering fetch on every keystroke
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '')

  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const featured = searchParams.get('featured') === 'true'

  // Load categories once
  useEffect(() => {
    supabase.from('categories').select('*').order('display_order').then(({ data }) => {
      setCategories(data || [])
    })
  }, [])

  // Fetch products whenever filters change - NO dependency on categories state
  // We resolve category slug → id independently
  useEffect(() => {
    fetchProducts()
  }, [q, category, featured, sort])

  async function fetchProducts() {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select('*, categories(name)', { count: 'exact' })
        .eq('is_active', true)

      if (q) query = query.ilike('name', `%${q}%`)
      if (featured) query = query.eq('is_featured', true)

      if (category) {
        // Resolve slug → id directly from DB, don't depend on local state
        const { data: catData } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', category)
          .single()
        if (catData?.id) {
          query = query.eq('category_id', catData.id)
        }
      }

      if (sort === 'price_asc') query = query.order('price', { ascending: true })
      else if (sort === 'price_desc') query = query.order('price', { ascending: false })
      else if (sort === 'newest') query = query.order('created_at', { ascending: false })
      else query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: false })

      const { data, count, error } = await query
      if (error) throw error
      setProducts((data || []).map(p => ({ ...p, category_name: p.categories?.name })))
      setTotal(count || 0)
    } catch (e) {
      console.error('fetchProducts error:', e)
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    const p = new URLSearchParams(searchParams)
    if (searchInput.trim()) p.set('q', searchInput.trim())
    else p.delete('q')
    setSearchParams(p)
  }

  function setCategory(slug) {
    const p = new URLSearchParams(searchParams)
    if (slug) p.set('category', slug)
    else p.delete('category')
    p.delete('featured')
    p.delete('q')
    setSearchInput('')
    setSearchParams(p)
  }

  function clearFilters() {
    setSearchInput('')
    setSearchParams({})
  }

  const hasFilters = q || category || featured

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          {q ? `Results for "${q}"` : featured ? '⭐ Featured Items' : category ? (categories.find(c => c.slug === category)?.name || 'Shop') : 'All Products'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
            {loading ? 'Loading...' : `${total} item${total !== 1 ? 's' : ''} found`}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} style={{ fontSize: 12, color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative', maxWidth: 480 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search products..."
            style={{ paddingLeft: 36, paddingRight: 80 }}
          />
          <button type="submit" className="btn btn-primary btn-sm" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}>
            Search
          </button>
        </div>
      </form>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', flex: 1 }}>
          <button className={`btn btn-sm ${!category && !featured ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setCategory('')}>
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`btn btn-sm ${category === cat.slug ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategory(cat.slug)}
            >{cat.name}</button>
          ))}
          <button className={`btn btn-sm ${featured ? 'btn-primary' : 'btn-secondary'}`} onClick={() => { const p = new URLSearchParams(); p.set('featured', 'true'); setSearchParams(p) }}>
            ⭐ Featured
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Sort:</span>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: 'auto', padding: '7px 12px', fontSize: 13, borderRadius: 8 }}>
            <option value="sort_order">Featured First</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
          <h3 style={{ marginBottom: 8, fontFamily: 'var(--font-display)' }}>No products found</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 20 }}>
            {hasFilters ? 'Try adjusting your search or filters.' : 'No products have been added yet.'}
          </p>
          {hasFilters && <button className="btn btn-primary" onClick={clearFilters}>View All Products</button>}
        </div>
      ) : (
        <div className="products-grid">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
