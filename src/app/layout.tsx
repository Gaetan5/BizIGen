import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'BizGen AI - Business Model Canvas & Business Plan Generator',
  description: 'Générez votre Business Model Canvas, Lean Canvas et Business Plan complet en 20 minutes avec l\'IA. Outil SaaS pour entrepreneurs africains.',
  keywords: ['business model canvas', 'lean canvas', 'business plan', 'IA', 'startup', 'Afrique', 'Cameroun'],
  authors: [{ name: 'BizGen AI' }],
  manifest: '/manifest.json',
  themeColor: '#000000',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BizGen AI',
  },
  openGraph: {
    title: 'BizGen AI - Business Model Canvas & Business Plan Generator',
    description: 'Générez votre Business Model Canvas, Lean Canvas et Business Plan complet en 20 minutes avec l\'IA.',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
