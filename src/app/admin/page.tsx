'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://vnufjfucwarjzrobrquy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudWZqZnVjd2Fyanpyb2JycXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTA2NjMsImV4cCI6MjA5NzY4NjY2M30.pG8v4Uwtz8rWBIU2CLvvdSkWpfo2yXKeuOKx0xZw5zI"
);

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false); // Controls modern alternate toggle
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // No-Code Config panel
  const [siteName, setSiteName] = useState('');
  const [ticker, setTicker] = useState('');
  const [heroHeading, setHeroHeading] = useState('');
  const [heroSubheading, setHeroSubheading] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  const [methods, setMethods] = useState('');

  // Item catalog panel
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
      setSiteName(data.site_name || ''); setTicker(data.ticker_text || '');
      setHeroHeading(data.hero_heading || ''); setHeroSubheading(data.hero_subheading || '');
      setPrimaryColor(data.primary_color || '#ffffff'); setMethods(data.payment_methods?.join(', ') || '');
    }
  }

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return alert('Fill fields');

    if (isSignUpMode) {
      // Sign up action
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return alert(error.message);
      alert('Registration successful! Session authorized.');
      setSession(data.session);
    } else {
      // Sign in action
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return alert(error.message);
      setSession(data.session);
    }
  };

  const saveSettings = async () => {
    const parsedMethods = methods.split(',').map(m => m.trim());
    const { error } = await supabase.from('site_config').update({
      site_name: siteName, ticker_text: ticker, hero_heading: heroHeading, hero_subheading: heroSubheading, primary_color: primaryColor, payment_methods: parsedMethods
    }).eq('id', 'default');
    
    if (!error) alert('System configuration array updated across public nodes.');
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

    const { error } = await supabase.from('products').insert({
      title: pTitle, description: pDesc, price: parseFloat(pPrice), category: pCat, image_url
    });
    
    if (!error) {
      alert('Product injected into marketplace registry.');
      setPTitle(''); setPPrice(''); setPDesc('');
    }
  };

  if (!session) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black px-6">
        <form onSubmit={handleAuthAction} className="w-full max-w-sm bg-zinc-950 border border-zinc-900 p-8 rounded-2xl space-y-6 shadow-2xl">
          <div className="text-center space-y-1">
            <h2 className="text-xs font-black tracking-[0.3em] text-white uppercase">{isSignUpMode ? 'Register Admin Node' : 'System Terminal Access'}</h2>
            <p className="text-[11px] text-zinc-500 font-medium">Provide encrypted credentials schema</p>
          </div>
          <div className="space-y-3">
            <input required type="email" placeholder="Identifier Email Address" onChange={(e)=>setEmail(e.target.value)} className="w-full p-3.5 rounded-xl text-xs bg-black border border-zinc-900 text-white focus:outline-none focus:border-zinc-800 transition" />
            <input required type="password" placeholder="Secure Key Passcode" onChange={(e)=>setPassword(e.target.value)} className="w-full p-3.5 rounded-xl text-xs bg-black border border-zinc-900 text-white focus:outline-none focus:border-zinc-800 transition" />
          </div>
          <button type="submit" className="w-full bg-white text-black font-black text-xs uppercase tracking-widest py-3.5 rounded-xl hover:bg-zinc-200 transition">
            {isSignUpMode ? 'Register and Login' : 'Authorize Credentials'}
          </button>
          
          <div className="text-center pt-2 space-y-3">
            <button 
              type="button" 
              onClick={() => setIsSignUpMode(!isSignUpMode)} 
              className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition block mx-auto"
            >
              {isSignUpMode ? '← Back to existing user login' : '✨ Create new master admin user'}
            </button>
            <a href="/" className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition block">← Return to public marketplace</a>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col px-6 md:px-16 max-w-[1500px] mx-auto pb-24 bg-black text-white">
      <header className="w-full flex justify-between items-center py-10 border-b border-zinc-900 mb-12">
        <div className="space-y-1">
          <h1 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Master Engine Node Terminal</h1>
          <p className="text-sm font-semibold text-white">Signed in as: <span className="text-zinc-400 font-normal">{session?.user?.email}</span></p>
        </div>
        <button onClick={() => supabase.auth.signOut().then(() => setSession(null))} className="bg-zinc-950 border border-zinc-900 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest text-red-500 hover:bg-zinc-900 transition">Lock Session</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start w-full">
        {/* Dynamic Theme Customizer */}
        <div className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">No-Code UI Theme Layout Customizer</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Marketplace Branding Title</label>
              <input value={siteName} onChange={(e)=>setSiteName(e.target.value)} className="w-full p-3 rounded-lg text-xs bg-black border border-zinc-900 text-white focus:outline-none"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Top-Bar Broadcast Marquee Alert</label>
              <input value={ticker} onChange={(e)=>setTicker(e.target.value)} className="w-full p-3 rounded-lg text-xs bg-black border border-zinc-900 text-white focus:outline-none"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Hero Section Large Header Accent</label>
              <input value={heroHeading} onChange={(e)=>setHeroHeading(e.target.value)} className="w-full p-3 rounded-lg text-xs bg-black border border-zinc-900 text-white focus:outline-none"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Hero Section Subtitle Copywriting</label>
              <textarea value={heroSubheading} onChange={(e)=>setHeroSubheading(e.target.value)} className="w-full p-3 rounded-lg text-xs bg-black border border-zinc-900 text-white h-20 resize-none focus:outline-none"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Branding Primary Base Hex Code Tone</label>
              <input value={primaryColor} onChange={(e)=>setPrimaryColor(e.target.value)} className="w-full p-3 rounded-lg text-xs bg-black border border-zinc-900 text-white focus:outline-none"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Payment Gateways Active (Delimited by commas)</label>
              <input value={methods} onChange={(e)=>setMethods(e.target.value)} className="w-full p-3 rounded-lg text-xs bg-black border border-zinc-900 text-white focus:outline-none"/>
            </div>
            <button onClick={saveSettings} className="w-full bg-white text-black font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-zinc-200 transition">Commit Layout Modifiers</button>
          </div>
        </div>

        {/* Product Catalog Registry */}
        <form onSubmit={addProduct} className="bg-zinc-950 border border-zinc-900 p-8 rounded-2xl space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">Inventory Management Registry</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Product Title</label>
              <input required placeholder="e.g. 2012 Elite Trader Account" value={pTitle} onChange={(e)=>setPTitle(e.target.value)} className="w-full p-3 rounded-lg text-xs bg-black border border-zinc-900 text-white focus:outline-none"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Valuation Price (USD)</label>
              <input required type="number" step="0.01" placeholder="99.99" value={pPrice} onChange={(e)=>setPPrice(e.target.value)} className="w-full p-3 rounded-lg text-xs bg-black border border-zinc-900 text-white focus:outline-none"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Description Data & Asset Diagnostics</label>
              <textarea placeholder="List inventory features or login payload distribution criteria..." value={pDesc} onChange={(e)=>setPDesc(e.target.value)} className="w-full p-3 rounded-lg text-xs bg-black border border-zinc-900 text-white h-24 resize-none focus:outline-none"/>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1">Classification Variant</label>
              <select value={pCat} onChange={(e)=>setPCat(e.target.value)} className="w-full p-3 rounded-lg text-xs bg-black border border-zinc-900 text-white focus:outline-none">
                <option value="Accounts">Accounts</option>
                <option value="Robux">Robux</option>
                <option value="Limiteds">Limiteds</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1.5">Asset Cover Image Media File</label>
              <input type="file" onChange={(e) => setPImage(e.target.files ? e.target.files[0] : null)} className="text-xs text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-zinc-900 file:text-zinc-300 file:font-semibold hover:file:bg-zinc-800 cursor-pointer"/>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] py-4 rounded-xl hover:bg-indigo-500 transition">Publish Item Live</button>
          </div>
        </form>
      </div>
    </div>
  );
}
