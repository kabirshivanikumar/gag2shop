'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://vnufjfucwarjzrobrquy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudWZqZnVjd2Fyanpyb2JycXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTA2NjMsImV4cCI6MjA5NzY4NjY2M30.pG8v4Uwtz8rWBIU2CLvvdSkWpfo2yXKeuOKx0xZw5zI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Config Form
  const [siteName, setSiteName] = useState('');
  const [ticker, setTicker] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#6366f1');
  const [methods, setMethods] = useState('');

  // Product Form
  const [pTitle, setPTitle] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pCat, setPCat] = useState('Accounts');
  const [pImage, setPImage] = useState<File | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSession(session);
    });
    loadConfig();
  }, [session]);

  async function loadConfig() {
    const { data } = await supabase.from('site_config').select('*').single();
    if (data) {
      setSiteName(data.site_name); setTicker(data.ticker_text);
      setPrimaryColor(data.primary_color); setMethods(data.payment_methods.join(', '));
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);

    const ADMIN_GATEKEEPER = "your-exact-admin-email@example.com"; // Replace with your setup email
    if (data.session?.user?.email !== ADMIN_GATEKEEPER) {
      await supabase.auth.signOut();
      setSession(null);
      return alert("Access Restricted.");
    }
    setSession(data.session);
  };

  const saveSettings = async () => {
    const parsedMethods = methods.split(',').map(m => m.trim());
    await supabase.from('site_config').update({
      site_name: siteName, ticker_text: ticker, primary_color: primaryColor, payment_methods: parsedMethods
    }).eq('id', 'default');
    alert('System settings overwritten successfully.');
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    let image_url = '';

    if (pImage) {
      const fileExt = pImage.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data } = await supabase.storage.from('product-images').upload(fileName, pImage);
      if (data) image_url = supabase.storage.from('product-images').getPublicUrl(fileName).data.publicUrl;
    }

    await supabase.from('products').insert({
      title: pTitle, description: pDesc, price: parseFloat(pPrice), category: pCat, image_url
    });
    alert('Catalog updated.');
    setPTitle(''); setPPrice(''); setPDesc('');
  };

  if (!session) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-zinc-950 px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-zinc-900 border border-zinc-800/80 p-8 rounded-2xl space-y-5 shadow-2xl">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white uppercase">Terminal Control</h2>
            <p className="text-xs text-zinc-500 font-medium">Provide encrypted administrative credentials</p>
          </div>
          <div className="space-y-3">
            <input type="email" placeholder="Identifier Email" onChange={(e)=>setEmail(e.target.value)} className="w-full p-3 rounded-lg text-sm bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-zinc-700 transition" />
            <input type="password" placeholder="Terminal Password" onChange={(e)=>setPassword(e.target.value)} className="w-full p-3 rounded-lg text-sm bg-zinc-950 border border-zinc-800 text-white focus:outline-none focus:border-zinc-700 transition" />
          </div>
          <button type="submit" className="w-full bg-white text-black font-semibold text-xs uppercase tracking-wider py-3.5 rounded-lg hover:bg-zinc-200 transition">Access Node</button>
          <div className="text-center pt-2">
            <a href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition">← Back to Marketplace</a>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col px-6 md:px-12 max-w-[1400px] mx-auto pb-12">
      <header className="w-full flex justify-between items-center py-8 border-b border-zinc-800/60 mb-12">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight text-white">System Engine Configuration</h1>
          <p className="text-xs text-zinc-500 font-medium">Control UI layout settings without editing software files</p>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => setSession(null))} className="bg-zinc-900 border border-zinc-800 px-4 py-2.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition">Exit Terminal</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start w-full">
        {/* Design System Customizer */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Theme Overrides</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide block mb-1">Marketplace Variant Name</label>
              <input value={siteName} onChange={(e)=>setSiteName(e.target.value)} className="w-full p-3 rounded-lg text-sm bg-zinc-950 border border-zinc-800 text-white focus:outline-none"/>
            </div>
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide block mb-1">Global Broadcast Banner Notice</label>
              <input value={ticker} onChange={(e)=>setTicker(e.target.value)} className="w-full p-3 rounded-lg text-sm bg-zinc-950 border border-zinc-800 text-white focus:outline-none"/>
            </div>
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide block mb-1">Primary Color Tone Selection</label>
              <input type="color" value={primaryColor} onChange={(e)=>setPrimaryColor(e.target.value)} className="w-full h-12 rounded-lg bg-zinc-950 border border-zinc-800 cursor-pointer p-1"/>
            </div>
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide block mb-1">Available Payment Channels (Delimited by commas)</label>
              <input value={methods} onChange={(e)=>setMethods(e.target.value)} className="w-full p-3 rounded-lg text-sm bg-zinc-950 border border-zinc-800 text-white focus:outline-none"/>
            </div>
            <button onClick={saveSettings} className="w-full bg-white text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg hover:bg-zinc-200 transition">Write Modifications to DB</button>
          </div>
        </div>

        {/* Product Catalog Registry */}
        <form onSubmit={addProduct} className="bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl space-y-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Inventory Management</h2>
          <div className="space-y-4">
            <input required placeholder="Product Title String" value={pTitle} onChange={(e)=>setPTitle(e.target.value)} className="w-full p-3 rounded-lg text-sm bg-zinc-950 border border-zinc-800 text-white focus:outline-none"/>
            <input required type="number" step="0.01" placeholder="Cost Base Valuation (USD)" value={pPrice} onChange={(e)=>setPPrice(e.target.value)} className="w-full p-3 rounded-lg text-sm bg-zinc-950 border border-zinc-800 text-white focus:outline-none"/>
            <textarea placeholder="Extended description details..." value={pDesc} onChange={(e)=>setPDesc(e.target.value)} className="w-full p-3 rounded-lg text-sm bg-zinc-950 border border-zinc-800 text-white h-24 resize-none focus:outline-none"/>
            <select value={pCat} onChange={(e)=>setPCat(e.target.value)} className="w-full p-3 rounded-lg text-sm bg-zinc-950 border border-zinc-800 text-white focus:outline-none">
              <option value="Accounts">Roblox Premium Accounts</option>
              <option value="Robux">Robux Currencies Pack</option>
              <option value="Limiteds">Virtual Trade Catalog Assets</option>
            </select>
            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide block mb-1.5">Asset Graphic Cover Upload</label>
              <input type="file" onChange={(e) => setPImage(e.target.files ? e.target.files[0] : null)} className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-zinc-800 file:text-zinc-300 file:font-semibold hover:file:bg-zinc-700 cursor-pointer"/>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg hover:bg-indigo-500 transition">Publish To Live Matrix</button>
          </div>
        </form>
      </div>
    </div>
  );
}
