'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI Theme Forms State
  const [siteName, setSiteName] = useState('');
  const [ticker, setTicker] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [methods, setMethods] = useState('');

  // New Product Form State
  const [pTitle, setPTitle] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCat, setPCat] = useState('Accounts');
  const [pImage, setPImage] = useState<File | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    loadConfig();
  }, [session]);

  async function loadConfig() {
    const { data } = await supabase.from('site_config').select('*').single();
    if (data) {
      setSiteName(data.site_name);
      setTicker(data.ticker_text);
      setPrimaryColor(data.primary_color);
      setMethods(data.payment_methods.join(', '));
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else setSession(data.session);
  };

  const saveSettings = async () => {
    const parsedMethods = methods.split(',').map(m => m.trim());
    const { error } = await supabase.from('site_config').update({
      site_name: siteName,
      ticker_text: ticker,
      primary_color: primaryColor,
      payment_methods: parsedMethods
    }).eq('id', 'default');

    if (!error) alert('Interface Settings Updated!');
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    let image_url = '';

    if (pImage) {
      const fileExt = pImage.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('product-images').upload(fileName, pImage);
      if (data) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
        image_url = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from('products').insert({
      title: pTitle,
      description: pDesc,
      price: parseFloat(pPrice),
      category: pCat,
      image_url
    });

    if (!error) {
      alert('Product published successfully!');
      setPTitle(''); setPPrice(''); setPDesc('');
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
        <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 w-full max-w-sm space-y-4">
          <h2 className="text-2xl font-bold text-center">Admin Access Portal</h2>
          <input type="email" placeholder="Admin Email" onChange={(e)=>setEmail(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700"/>
          <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700"/>
          <button type="submit" className="w-full bg-indigo-600 py-2.5 rounded font-bold hover:bg-indigo-500">Authenticate</button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto text-white space-y-12">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black">⚙️ No-Code Store Engine Dashboard</h1>
        <button onClick={() => supabase.auth.signOut().then(() => setSession(null))} className="bg-red-600 px-4 py-2 rounded text-sm font-semibold">Sign Out</button>
      </div>

      {/* Dynamic Customization Segment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
          <h2 className="text-xl font-bold">Theme & UI Control</h2>
          <div>
            <label className="text-xs text-gray-400">Store Title Name</label>
            <input value={siteName} onChange={(e)=>setSiteName(e.target.value)} className="w-full p-2 rounded bg-zinc-800 mt-1"/>
          </div>
          <div>
            <label className="text-xs text-gray-400">Ticker Alert Text</label>
            <input value={ticker} onChange={(e)=>setTicker(e.target.value)} className="w-full p-2 rounded bg-zinc-800 mt-1"/>
          </div>
          <div>
            <label className="text-xs text-gray-400">Primary Branding Color</label>
            <input type="color" value={primaryColor} onChange={(e)=>setPrimaryColor(e.target.value)} className="w-full h-10 rounded bg-zinc-800 mt-1 cursor-pointer"/>
          </div>
          <div>
            <label className="text-xs text-gray-400">Payment Portals (Comma Separated)</label>
            <input value={methods} onChange={(e)=>setMethods(e.target.value)} className="w-full p-2 rounded bg-zinc-800 mt-1"/>
          </div>
          <button onClick={saveSettings} className="w-full bg-emerald-600 py-2.5 rounded font-bold hover:bg-emerald-500">Apply Visual Updates</button>
        </div>

        {/* Product Creation Segment */}
        <form onSubmit={addProduct} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
          <h2 className="text-xl font-bold">Add New Store Catalog Item</h2>
          <input required placeholder="Item / Account Title" value={pTitle} onChange={(e)=>setPTitle(e.target.value)} className="w-full p-2 rounded bg-zinc-800"/>
          <input required type="number" step="0.01" placeholder="Price (USD)" value={pPrice} onChange={(e)=>setPPrice(e.target.value)} className="w-full p-2 rounded bg-zinc-800"/>
          <textarea placeholder="Product Description & Credentials" value={pDesc} onChange={(e)=>setPDesc(e.target.value)} className="w-full p-2 rounded bg-zinc-800 h-20"/>
          <select value={pCat} onChange={(e)=>setPCat(e.target.value)} className="w-full p-2 rounded bg-zinc-800">
            <option value="Accounts">Roblox Accounts</option>
            <option value="Robux">Robux Packs</option>
            <option value="Limiteds">In-Game Limiteds</option>
          </select>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Product Media Cover</label>
            <input type="file" onChange={(e) => setPImage(e.target.files ? e.target.files[0] : null)} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700"/>
          </div>
          <button type="submit" className="w-full bg-indigo-600 py-2.5 rounded font-bold hover:bg-indigo-500">Publish to Store</button>
        </form>
      </div>
    </div>
  );
}
