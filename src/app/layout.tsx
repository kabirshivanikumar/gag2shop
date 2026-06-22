import { Inter } from 'next/font/google';
import './globals.css';
import { createClient } from '@supabase/supabase-js';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function generateMetadata() {
  const { data } = await supabase.from('site_config').select('site_name').single();
  return { title: data?.site_name || 'Roblox Shop' };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: config } = await supabase.from('site_config').select('*').single();

  const themeStyles = {
    '--primary': config?.primary_color || '#6366f1',
    '--bg-main': config?.background_color || '#09090b',
    '--bg-card': config?.card_color || '#141417',
    '--text-main': config?.text_color || '#fafafa',
  } as React.CSSProperties;

  return (
    <html lang="en" style={themeStyles} className={`${inter.variable}`}>
      <body className="bg-[var(--bg-main)] text-[var(--text-main)] font-sans antialiased min-h-screen flex flex-col m-0 p-0">
        {config?.ticker_text && (
          <div className="w-full bg-[var(--primary)] text-black font-semibold py-2.5 text-center text-xs uppercase tracking-widest overflow-hidden whitespace-nowrap select-none border-b border-white/10 shrink-0">
            <div className="animate-marquee inline-block">{config.ticker_text}</div>
          </div>
        )}
        <div className="flex-1 w-full flex flex-col">{children}</div>
      </body>
    </html>
  );
}
