import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TClothes — Premium Streetwear',
  description:
    'TClothes — Exclusive streetwear and premium apparel. Featuring the Achilles Design collection.',
  keywords: ['TClothes', 'streetwear', 'Achilles Design', 'premium apparel', 't-shirts'],
  authors: [{ name: 'TClothes' }],
  openGraph: {
    title: 'TClothes — Premium Streetwear',
    description: 'Exclusive streetwear and premium apparel.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-brand-bg text-white antialiased">{children}</body>
    </html>
  );
}
