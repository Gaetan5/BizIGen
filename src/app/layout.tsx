import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'BizGen AI - Business Model Canvas & Business Plan Generator',
  description: 'Générez votre Business Model Canvas, Lean Canvas et Business Plan complet en 20 minutes avec l\'IA. Outil SaaS pour entrepreneurs africains.',
  keywords: ['business model canvas', 'lean canvas', 'business plan', 'IA', 'startup', 'Afrique', 'Cameroun'],
  authors: [{ name: 'BizGen AI' }],
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
