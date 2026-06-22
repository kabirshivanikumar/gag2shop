'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vnufjfucwarjzrobrquy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudWZqZnVjd2Fyanpyb2JycXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTA2NjMsImV4cCI6MjA5NzY4NjY2M30.pG8v4Uwtz8rWBIU2CLvvdSkWpfo2yXKeuOKx0xZw5zI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');

  useEffect(() => {
    async function fetchData() {
      const { data: prodData } = await supabase.from('products').select('*').eq('is_active', true);
      const { data: confData } = await supabase.from('site_config').select('*').single();
      
      setProducts(prodData || []);
      setConfig(confData);
      
      if (confData) {
        document.documentElement.style.setProperty('--primary', confData.primary_color || '#6366f1');
        if (confData.payment_methods?.length) setSelectedPayment(confData.payment_methods[0]);
      }
    }
    fetchData();
  }, []);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || cart.length === 0) return;

    const total = cart.reduce((acc, item) => acc + item.price, 0);
    const { error } = await supabase.from('orders').insert({
      email, items: cart, total_amount: total, payment_method: selectedPayment, status: 'Pending'
    });

    if (!error) {
      alert('Order securely dispatched! Check your email inbox for access credentials.');
      setCart([]);
      setIsCartOpen(false);
    }
  };

  return (
    <main className="w-full flex-1 flex flex-col px-6 md:px-12 max-w-[1600px] mx-auto pb-12">
      <header className="w-full flex justify-between items-center py-8 border-b border-zinc-800/60 mb-12">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">{config?.site_name || 'BloxShop'}</h1>
          <p className="text-xs text-zinc-500 mt-0.5 font-medium tracking-wide">Premium Roblox Marketplace</p>
        </div>
        <div className="flex items-center gap-4">
          <a href="/admin" className="text-xs font-semibold text-zinc-400 hover:text-white tracking-wide transition">
            Admin Portal
          </a>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-white text-black font-semibold text-xs uppercase tracking-wider px-5 py-3 rounded-lg hover:bg-zinc-200 transition shadow-sm"
          >
            Basket ({cart.length})
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {products.map((product) => (
          <div key={product.id} className="bg-[var(--bg-card)] rounded-2xl border border-zinc-800/80 overflow-hidden flex flex-col group transition hover:border-zinc-700/80">
            <div className="w-full h-56 bg-zinc-950 overflow-hidden relative">
              <img src={product.image_url || 'https://via.placeholder.com/400x300'} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-widest block mb-1">{product.category}</span>
                <h3 className="text-lg font-bold text-white tracking-tight">{product.title}</h3>
                <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed font-medium line-clamp-2">{product.description}</p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/40">
                <span className="text-xl font-black tracking-tight text-white">${product.price}</span>
                <button 
                  onClick={() => setCart([...cart, product])}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800 px-4 py-2 rounded-lg text-xs font-bold transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Slideout Cart panel */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-end z-50 animate-fadeIn">
          <div className="bg-zinc-950 w-full max-w-md h-full p-8 flex flex-col justify-between text-white border-l border-zinc-900 shadow-2xl">
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-900">
                <h2 className="text-lg font-bold uppercase tracking-wider">Your Basket</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-500 hover:text-white transition text-sm">✕ Close</button>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {cart.length === 0 && <p className="text-zinc-500 text-xs font-medium">Your basket is currently empty.</p>}
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-900/40 border border-zinc-900 p-4 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm text-white tracking-tight">{item.title}</p>
                      <p className="text-[11px] text-[var(--primary)] font-bold mt-0.5">${item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleCheckout} className="border-t border-zinc-900 pt-6 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold mb-1.5 text-zinc-400">Delivery Email</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 text-sm rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-zinc-700 transition" placeholder="example@domain.com"/>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold mb-1.5 text-zinc-400">Payment Channel</label>
                <select value={selectedPayment} onChange={(e) => setSelectedPayment(e.target.value)} className="w-full p-3 text-sm rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-zinc-700 transition">
                  {config?.payment_methods?.map((method: string) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between text-base font-bold pt-4 border-t border-zinc-900">
                <span className="text-zinc-400">Total Sum:</span>
                <span className="text-white font-black">${cart.reduce((a, b) => a + b.price, 0).toFixed(2)}</span>
              </div>

              <button type="submit" className="w-full bg-white text-black font-bold text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-zinc-200 transition">
                Authorize Checkout
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
