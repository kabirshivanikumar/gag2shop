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
      
      // Inject theme dynamically using CSS custom properties
      if (confData) {
        document.documentElement.style.setProperty('--primary', confData.primary_color || '#4F46E5');
        if (confData.payment_methods?.length) setSelectedPayment(confData.payment_methods[0]);
      }
    }
    fetchData();
  }, []);

  const addToCart = (product: any) => {
    setCart([...cart, product]);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || cart.length === 0) return alert('Cart is empty or email missing!');

    const total = cart.reduce((acc, item) => acc + item.price, 0);

    const { error } = await supabase.from('orders').insert({
      email,
      items: cart,
      total_amount: total,
      payment_method: selectedPayment,
      status: 'Pending'
    });

    if (!error) {
      alert('Order placed successfully! Check your email for delivery details.');
      setCart([]);
      setIsCartOpen(false);
    } else {
      alert('Checkout failed. Please try again.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-zinc-950 text-white font-sans">
      {/* Dynamic No-Code Ticker */}
      {config?.ticker_text && (
        <div className="fixed top-0 left-0 w-full bg-[var(--primary)] text-black font-black py-2 text-center text-sm z-50 overflow-hidden">
          <div className="inline-block animate-pulse">{config.ticker_text}</div>
        </div>
      )}

      <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4 pt-12">
        <h1 className="text-3xl font-extrabold tracking-wider">{config?.site_name || 'Roblox Shop'}</h1>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="bg-[var(--primary)] text-black px-5 py-2.5 rounded-lg font-bold hover:opacity-90 transition"
        >
          🛒 Cart ({cart.length})
        </button>
      </header>

      {/* Main Grid Catalog */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition">
            <img src={product.image_url || 'https://via.placeholder.com/300'} alt={product.title} className="w-full h-48 object-cover rounded-lg mb-4 bg-zinc-800" />
            <div>
              <span className="text-xs text-[var(--primary)] font-bold uppercase tracking-widest">{product.category}</span>
              <h3 className="text-xl font-bold mt-1 text-white">{product.title}</h3>
              <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{product.description}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xl font-black text-[var(--primary)]">${product.price}</span>
              <button 
                onClick={() => addToCart(product)}
                className="bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-md text-sm transition"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-out Checkout Interface */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-end z-50">
          <div className="bg-zinc-900 w-full max-w-md h-full p-6 flex flex-col justify-between text-white border-l border-zinc-800">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Basket</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-white text-xl">✕</button>
              </div>
              
              <div className="space-y-4 overflow-y-auto max-h-[60vh]">
                {cart.length === 0 ? <p className="text-zinc-500">Your cart is currently empty.</p> : null}
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between bg-zinc-800 p-3 rounded-lg border border-zinc-700">
                    <div>
                      <p className="font-semibold text-white">{item.title}</p>
                      <p className="text-xs text-[var(--primary)] font-bold">${item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleCheckout} className="border-t border-zinc-800 pt-4 space-y-4">
              <div>
                <label className="block text-sm mb-1 text-zinc-400">Delivery Email Address</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700 text-white" placeholder="yourname@gmail.com"/>
              </div>

              <div>
                <label className="block text-sm mb-1 text-zinc-400">Select Gateway</label>
                <select value={selectedPayment} onChange={(e) => setSelectedPayment(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700 text-white">
                  {config?.payment_methods?.map((method: string) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between text-lg font-bold border-t border-zinc-800 pt-2">
                <span>Grand Total:</span>
                <span className="text-[var(--primary)]">${cart.reduce((a, b) => a + b.price, 0).toFixed(2)}</span>
              </div>

              <button type="submit" className="w-full bg-[var(--primary)] py-3 rounded-xl font-bold text-black text-center hover:opacity-90 transition">
                Secure Instant Checkout
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
