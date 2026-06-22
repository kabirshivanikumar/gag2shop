'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

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
      if (confData?.payment_methods?.length) setSelectedPayment(confData.payment_methods[0]);
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
      alert('Checkout failed.');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-extrabold tracking-wider">{config?.site_name}</h1>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="bg-[var(--primary)] px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition"
        >
          🛒 Cart ({cart.length})
        </button>
      </header>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} style={{ backgroundColor: 'var(--bg-card)' }} className="p-4 rounded-xl border border-gray-800 flex flex-col justify-between">
            <img src={product.image_url || 'https://via.placeholder.com/150'} alt={product.title} className="w-full h-48 object-cover rounded-lg mb-4" />
            <div>
              <span className="text-xs text-gray-400 uppercase tracking-widest">{product.category}</span>
              <h3 className="text-xl font-bold mt-1">{product.title}</h3>
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{product.description}</p>
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

      {/* Checkout Sidebar/Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-end z-50 animate-fadeIn">
          <div className="bg-zinc-900 w-full max-w-md h-full p-6 flex flex-col justify-between text-white">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white text-xl">✕</button>
              </div>
              
              <div className="space-y-4 overflow-y-auto max-h-[50vh]">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between bg-zinc-800 p-3 rounded-lg">
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-xs text-gray-400">${item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handleCheckout} className="border-t border-zinc-800 pt-4 space-y-4">
              <div>
                <label className="block text-sm mb-1 text-gray-300">Delivery Email Address</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-[var(--primary)]" placeholder="builder@roblox.com"/>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-300">Payment Option</label>
                <select value={selectedPayment} onChange={(e) => setSelectedPayment(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700">
                  {config?.payment_methods?.map((method: string) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${cart.reduce((a, b) => a + b.price, 0).toFixed(2)}</span>
              </div>

              <button type="submit" className="w-full bg-[var(--primary)] py-3 rounded-xl font-bold text-black hover:opacity-90 transition">
                Complete Instant Order
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
