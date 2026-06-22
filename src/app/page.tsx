'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://vnufjfucwarjzrobrquy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudWZqZnVjd2Fyanpyb2JycXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTA2NjMsImV4cCI6MjA5NzY4NjY2M30.pG8v4Uwtz8rWBIU2CLvvdSkWpfo2yXKeuOKx0xZw5zI"
);

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [email, setEmail] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');

  useEffect(() => {
    async function initStore() {
      const { data: pData } = await supabase.from('products').select('*').eq('is_active', true);
      const { data: cData } = await supabase.from('site_config').select('*').single();
      
      setProducts(pData || []);
      setFilteredProducts(pData || []);
      setConfig(cData);
      
      if (cData) {
        document.documentElement.style.setProperty('--primary', cData.primary_color || '#ffffff');
        if (cData.payment_methods?.length) setSelectedPayment(cData.payment_methods[0]);
      }
    }
    initStore();
  }, []);

  const filterCategory = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === cat));
    }
  };

  const removeFromCart = (indexToRemove: number) => {
    setCart(cart.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || cart.length === 0) return;
    const total = cart.reduce((acc, item) => acc + item.price, 0);

    const { error } = await supabase.from('orders').insert({
      email, items: cart, total_amount: total, payment_method: selectedPayment, status: 'Pending'
    });

    if (!error) {
      alert('🔒 Transaction secure. Your items have been securely dispatched to your email address!');
      setCart([]);
      setIsCartOpen(false);
    }
  };

  return (
    <main className="w-full flex-1 flex flex-col bg-black text-white selection:bg-white selection:text-black">
      {/* Editorial Navigation Header */}
      <nav className="w-full border-b border-zinc-900 sticky top-0 bg-black/80 backdrop-blur-md z-40 px-6 md:px-16 py-5 flex justify-between items-center">
        <div className="flex flex-col">
          <a href="/" className="text-xl font-black uppercase tracking-[0.25em] text-white hover:opacity-80 transition">{config?.site_name || 'Vanguard'}</a>
        </div>
        
        <div className="flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-zinc-400">
          <button onClick={() => filterCategory('All')} className={`hover:text-white transition ${selectedCategory === 'All' ? 'text-white underline underline-offset-4' : ''}`}>Catalog</button>
          <a href="/admin" className="hover:text-white transition border border-zinc-800 px-4 py-2 rounded-full bg-zinc-950">Dashboard Hub</a>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative text-white bg-zinc-900 border border-zinc-800 px-5 py-2.5 rounded-full hover:bg-white hover:text-black transition flex items-center gap-2"
          >
            <span>Cart</span>
            <span className="bg-white text-black text-[10px] px-1.5 py-0.5 rounded-full font-black group-hover:bg-black group-hover:text-white">{cart.length}</span>
          </button>
        </div>
      </nav>

      {/* Influencer Hero Banner */}
      <header className="px-6 md:px-16 pt-24 pb-16 max-w-5xl text-left border-b border-zinc-900 w-full mx-auto flex flex-col space-y-6">
        <span className="text-[10px] tracking-[0.4em] font-black text-zinc-500 uppercase block">Curated Virtual Assets Collection // 2026</span>
        <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.05] uppercase max-w-4xl">
          {config?.hero_heading || 'THE NEW STANDARD OF ROBLOX TRADING'}
        </h2>
        <p className="text-zinc-400 text-sm md:text-base font-medium max-w-2xl leading-relaxed">
          {config?.hero_subheading || 'Curated premium accounts, rare collections, and high-tier assets for elite players.'}
        </p>
      </header>

      {/* Product Catalog Core Grid */}
      <section className="px-6 md:px-16 max-w-[1600px] mx-auto w-full py-16 flex-1">
        {/* Category Sorting Navigation Tab Row */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 border-b border-zinc-900/40">
          {['All', 'Accounts', 'Robux', 'Limiteds'].map((cat) => (
            <button
              key={cat}
              onClick={() => filterCategory(cat)}
              className={`text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-md transition ${selectedCategory === cat ? 'bg-white text-black' : 'bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog Responsive Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filteredProducts.map((product) => (
            <div key={product.id} className="group relative flex flex-col justify-between space-y-4">
              <div className="w-full aspect-[4/5] bg-zinc-950 overflow-hidden rounded-xl border border-zinc-900 relative">
                <img src={product.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600'} alt={product.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition duration-700 opacity-90 group-hover:opacity-100" />
                <button 
                  onClick={() => setCart([...cart, product])}
                  className="absolute bottom-4 left-4 right-4 bg-white/95 text-black py-3 rounded-lg text-xs font-bold uppercase tracking-widest shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition duration-300 backdrop-blur-sm hover:bg-white"
                >
                  Quick Add +
                </button>
              </div>
              <div className="flex justify-between items-start px-1">
                <div className="space-y-1 max-w-[70%]">
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">{product.category}</span>
                  <h3 className="text-sm font-bold text-zinc-100 tracking-tight leading-tight">{product.title}</h3>
                  <p className="text-zinc-500 text-[11px] line-clamp-1 font-medium">{product.description}</p>
                </div>
                <span className="text-sm font-black tracking-tight text-white bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md">${product.price}</span>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && <p className="text-zinc-600 text-xs uppercase tracking-widest py-12">No inventory listed under this category context.</p>}
        </div>
      </section>

      {/* Drawer Overlay Slide Out Shopping Cart */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex justify-end z-50">
          <div className="bg-black w-full max-w-md h-full p-8 flex flex-col justify-between border-l border-zinc-900 shadow-2xl text-white">
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center mb-12 pb-4 border-b border-zinc-900">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Shopping Bag // Bag ({cart.length})</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-500 hover:text-white transition text-xs uppercase tracking-widest">✕ Close</button>
              </div>
              
              <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                {cart.length === 0 && <p className="text-zinc-600 text-xs uppercase tracking-widest font-semibold mt-4">Your bag is currently empty.</p>}
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-950 border border-zinc-900 p-4 rounded-xl">
                    <div className="space-y-0.5">
                      <p className="font-bold text-xs tracking-tight text-white">{item.title}</p>
                      <p className="text-[11px] text-zinc-400 font-bold">${item.price}</p>
                    </div>
                    <button onClick={() => removeFromCart(idx)} className="text-[10px] font-bold text-red-500 hover:text-red-400 uppercase tracking-wider">Remove</button>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleCheckout} className="border-t border-zinc-900 pt-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-black mb-1.5 text-zinc-500">Delivery Target Email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3.5 text-xs rounded-xl bg-zinc-950 border border-zinc-900 text-white focus:outline-none focus:border-zinc-700 transition" placeholder="name@domain.com"/>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-black mb-1.5 text-zinc-500">Payment Processing Terminal</label>
                <select value={selectedPayment} onChange={(e) => setSelectedPayment(e.target.value)} className="w-full p-3.5 text-xs rounded-xl bg-zinc-950 border border-zinc-900 text-white focus:outline-none focus:border-zinc-700 transition">
                  {config?.payment_methods?.map((method: string) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-baseline text-sm font-bold pt-4 border-t border-zinc-900">
                <span className="text-zinc-500 uppercase tracking-widest text-[11px]">Subtotal:</span>
                <span className="text-white font-black text-xl">${cart.reduce((a, b) => a + b.price, 0).toFixed(2)}</span>
              </div>

              <button type="submit" className="w-full bg-white text-black font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-zinc-200 transition shadow-2xl">
                Place Secure Order
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
