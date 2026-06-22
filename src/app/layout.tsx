import { createClient } from '@supabase/supabase-js';
import './globals.css';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function generateMetadata() {
  const { data } = await supabase.from('site_config').select('site_name').single();
  return { title: data?.site_name || 'Roblox Shop' };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: config } = await supabase.from('site_config').select('*').single();

  // Create dynamic inline styles based on admin dashboard settings
  const themeStyles = {
    '--primary': config?.primary_color || '#4F46E5',
    '--bg-main': config?.background_color || '#0F172A',
    '--bg-card': config?.card_color || '#1E293B',
    '--text-main': config?.text_color || '#FFFFFF',
  } as React.CSSProperties;

  return (
    <html lang="en" style={themeStyles}>
      <body className="bg-[var(--bg-main)] text-[var(--text-main)] min-h-screen font-sans">
        {/* No-Code Dynamic Ticker */}
        {config?.ticker_text && (
          <div className="w-full bg-[var(--primary)] text-black font-bold py-2 text-center text-sm overflow-hidden whitespace-nowrap">
            <div className="animate-marquee inline-block">{config.ticker_text}</div>
          </div>
        )}
        {children}
      </body>
    </html>
  );
}
