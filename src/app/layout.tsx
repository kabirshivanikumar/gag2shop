import { Inter } from 'next/font/google';
import './globals.css';
import { createClient } from '@supabase/supabase-js';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const supabase = createClient(
  "https://vnufjfucwarjzrobrquy.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudWZqZnVjd2Fyanpyb2JycXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTA2NjMsImV4cCI6MjA5NzY4NjY2M30.pG8v4Uwtz8rWBIU2CLvvdSkWpfo2yXKeuOKx0xZw5zI"
);

export async function generateMetadata() {
  const { data } = await supabase.from('site_config').select('site_name').single();
  return { title: data?.site_name || 'Vanguard Marketplace' };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: config } = await supabase.from('site_config').select('*').single();

  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="bg-black text-white font-sans antialiased min-h-screen flex flex-col m-0 p-0 selection:bg-white selection:text-black">
        {config?.ticker_text && (
          <div className="w-full bg-white text-black font-black py-3 text-center text-[10px] uppercase tracking-[0.2em] overflow-hidden whitespace-nowrap select-none border-b border-zinc-900 shrink-0">
            <div className="animate-marquee inline-block">{config.ticker_text}</div>
          </div>
        )}
        <div className="flex-1 w-full flex flex-col">{children}</div>
      </body>
    </html>
  );
}
