import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TClothes — Streetwear premium',
  description: 'TClothes — Roupa urbana premium da coleção Achilles Design.',
  keywords: ['TClothes', 'streetwear', 'Achilles Design', 'premium apparel', 't-shirts'],
  authors: [{ name: 'TClothes' }],
  openGraph: {
    title: 'TClothes — Streetwear premium',
    description: 'Conheça a coleção Achilles Design da TClothes.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT" className={inter.variable}>
      <body className="bg-brand-bg text-white antialiased">{children}</body>
    </html>
  );
}
