import { getDb } from '@/lib/db';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AchillesDesignSection from '@/components/AchillesDesignSection';
import Footer from '@/components/Footer';

interface Product {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  status: 'active' | 'coming_soon' | 'hidden';
  created_at: string;
}

function getProducts(): Product[] {
  try {
    const db = getDb();
    return db
      .prepare(
        `SELECT id, name, category, description, price, image_url, status, created_at
         FROM products
         WHERE status != 'hidden'
         ORDER BY created_at ASC`
      )
      .all() as Product[];
  } catch {
    return [];
  }
}

export const dynamic = 'force-dynamic';

export default function HomePage() {
  const products = getProducts();

  return (
    <main className="min-h-screen bg-brand-bg">
      <Navbar />
      <HeroSection />

      <AchillesDesignSection products={products} />

      {/* About Section */}
      <section id="about" className="py-24 md:py-32 bg-brand-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
            Our Story
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8">
            Built for Legends
          </h2>
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px w-16 bg-gold/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            <div className="h-px w-16 bg-gold/40" />
          </div>
          <div className="space-y-6 text-brand-muted leading-relaxed">
            <p>
              TClothes was born from a simple belief: that what you wear is an extension of
              who you are. Every stitch, every fabric choice, every design — intentional.
            </p>
            <p>
              The{' '}
              <span className="text-gold font-medium">Achilles Design</span> collection
              draws inspiration from the timeless warrior spirit — unstoppable,
              uncompromising, and undeniably stylish. We create pieces that don&apos;t just
              follow trends; they set them.
            </p>
            <p>
              Crafted for those who refuse to settle. Worn by those who lead.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-sm mx-auto">
            {[
              { value: '100%', label: 'Premium Cotton' },
              { value: 'PT', label: 'Made in Portugal' },
              { value: '∞', label: 'Limited Drops' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-serif font-bold text-gold mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-brand-muted tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
