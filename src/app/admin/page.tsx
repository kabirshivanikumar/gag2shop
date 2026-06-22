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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSession(session);
    });
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
    
    if (error) {
      alert(error.message);
      return;
    }

    // SECURITY OVERLAY: Enter your chosen admin account email below
    const ADMIN_GATEKEEPER = "your-exact-admin-email@example.com"; 

    if (data.session?.user?.email !== ADMIN_GATEKEEPER) {
      await supabase.auth.signOut();
      alert("Unauthorized Access Attempt Detected.");
      setSession(null);
      return;
    }

    setSession(data.session);
  };

  const saveSettings = async () => {
    const parsedMethods = methods.split(',').map(m => m.trim());
    const { error } = await supabase.from('site_config').update({
      site_name: siteName,
      ticker_text: ticker,
      primary_color: primaryColor,
      payment_methods: parsedMethods
    }).eq('id', 'default');

    if (!error) alert('Dynamic Interface Configurations Applied!');
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
      alert('Product published live to the user catalog!');
      setPTitle(''); setPPrice(''); setPDesc('');
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white px-4">
        <form onSubmit={handleLogin} className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 w-full max-w-sm space-y-4 shadow-2xl">
          <h2 className="text-2xl font-black text-center tracking-wide text-indigo-500">Shop Admin Access</h2>
          <input type="email" placeholder="Admin Email" onChange={(e)=>setEmail(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none"/>
          <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700 text-white focus:outline-none"/>
          <button type="submit" className="w-full bg-indigo-600 py-2.5 rounded font-bold hover:bg-indigo-500 transition">Unlock Controls</button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto text-white space-y-12 bg-zinc-950 min-h-screen">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-black text-indigo-400">⚙️ Master Storefront Control Panel</h1>
        <button onClick={() => supabase.auth.signOut().then(() => setSession(null))} className="bg-zinc-800 border border-zinc-700 px-4 py-2 rounded text-sm font-semibold hover:bg-zinc-700">Lock Terminal</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Real-time Theme Editor */}
        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-zinc-200">No-Code Layout customization</h2>
          <div>
            <label className="text-xs text-zinc-400 font-bold block mb-1">Store Front Title</label>
            <input value={siteName} onChange={(e)=>setSiteName(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700 text-white"/>
          </div>
          <div>
            <label className="text-xs text-zinc-400 font-bold block mb-1">Live Header Banner Announcement</label>
            <input value={ticker} onChange={(e)=>setTicker(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700 text-white"/>
          </div>
          <div>
            <label className="text-xs text-zinc-400 font-bold block mb-1">Primary Branding Theme Color</label>
            <input type="color" value={primaryColor} onChange={(e)=>setPrimaryColor(e.target.value)} className="w-full h-11 rounded bg-zinc-800 border border-zinc-700 cursor-pointer"/>
          </div>
          <div>
            <label className="text-xs text-zinc-400 font-bold block mb-1">Accepted Payment Options (Comma Separated)</label>
            <input value={methods} onChange={(e)=>setMethods(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700 text-white"/>
          </div>
          <button onClick={saveSettings} className="w-full bg-emerald-600 py-3 rounded-lg font-bold hover:bg-emerald-500 transition">Update Store Style</button>
        </div>

        {/* Catalog Control */}
        <form onSubmit={addProduct} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-zinc-200">Publish New Item Listing</h2>
          <input required placeholder="Account or Item Name" value={pTitle} onChange={(e)=>setPTitle(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700 text-white"/>
          <input required type="number" step="0.01" placeholder="Price Tag (USD)" value={pPrice} onChange={(e)=>setPPrice(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700 text-white"/>
          <textarea placeholder="Product description, account tier data, or instant credentials info..." value={pDesc} onChange={(e)=>setPDesc(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700 text-white h-24 resize-none"/>
          <select value={pCat} onChange={(e)=>setPCat(e.target.value)} className="w-full p-2.5 rounded bg-zinc-800 border border-zinc-700 text-white">
            <option value="Accounts">Roblox Accounts</option>
            <option value="Robux">Robux Packs</option>
            <option value="Limiteds">In-Game Items / Limiteds</option>
          </select>
          <div>
            <label className="text-xs text-zinc-400 font-bold block mb-1">Upload Public Product Image Asset</label>
            <input type="file" onChange={(e) => setPImage(e.target.files ? e.target.files[0] : null)} className="text-xs text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700"/>
          </div>
          <button type="submit" className="w-full bg-indigo-600 py-3 rounded-lg font-bold hover:bg-indigo-500 transition">Push Live to Frontpage</button>
        </form>
      </div>
    </div>
  );
}
