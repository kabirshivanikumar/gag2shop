import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ProductCard from '../components/shop/ProductCard'

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [sort, setSort] = useState('sort_order')
  const [priceRange, setPriceRange] = useState([0, 999])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const featured = searchParams.get('featured') === 'true'

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [q, category, featured, sort])

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('display_order')
    setCategories(data || [])
  }

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
        const cat = categories.find(c => c.slug === category)
        if (cat) query = query.eq('category_id', cat.id)
      }

      if (sort === 'price_asc') query = query.order('price', { ascending: true })
      else if (sort === 'price_desc') query = query.order('price', { ascending: false })
      else if (sort === 'newest') query = query.order('created_at', { ascending: false })
      else query = query.order('sort_order').order('created_at', { ascending: false })

      const { data, count } = await query
      setProducts((data || []).map(p => ({ ...p, category_name: p.categories?.name })))
      setTotal(count || 0)
    } finally {
      setLoading(false)
    }
  }

  function setCategory(slug) {
    const p = new URLSearchParams(searchParams)
    if (slug) p.set('category', slug)
    else p.delete('category')
    p.delete('featured')
    setSearchParams(p)
  }

  return (
    <div className="container" style={{ padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          {q ? `Search: "${q}"` : featured ? 'Featured Items' : category ? categories.find(c => c.slug === category)?.name || 'Shop' : 'All Products'}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>{total} items found</p>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${!category && !featured ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCategory('')}
          >All</button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`btn btn-sm ${category === cat.slug ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategory(cat.slug)}
            >{cat.name}</button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Sort:</span>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{ width: 'auto', padding: '7px 12px', fontSize: 13, borderRadius: 8 }}
          >
            <option value="sort_order">Featured</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <h3 style={{ marginBottom: 8 }}>No products found</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>Try a different search or category</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
