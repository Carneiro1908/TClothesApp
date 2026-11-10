import { getDb } from '@/lib/db';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import AchillesDesignSection from '@/components/AchillesDesignSection';
import Footer from '@/components/Footer';
import NewArrivalsSection from '@/components/NewArrivalsSection';

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
      <NewArrivalsSection />

      <section id="lancamento" className="border-y border-brand-border bg-brand-bg px-4 py-20 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.4em] text-gold">Marque na agenda</p>
        <h2 className="font-serif text-4xl font-bold text-white md:text-5xl">Lançamento previsto</h2>
        <time dateTime="2026-11-20" className="mt-4 block font-serif text-3xl text-gold md:text-4xl">20 de novembro de 2026</time>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 md:py-32 bg-brand-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
            A nossa história
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-8">
            Feita para lendas
          </h2>
          <div className="flex items-center justify-center gap-4 mb-10">
            <div className="h-px w-16 bg-gold/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            <div className="h-px w-16 bg-gold/40" />
          </div>
          <div className="space-y-6 text-brand-muted leading-relaxed">
            <p>
              A TClothes nasceu de uma ideia simples: aquilo que vestimos expressa quem somos.
              Cada ponto, tecido e desenho é escolhido com intenção.
            </p>
            <p>
              The{' '}
              <span className="text-gold font-medium">Achilles Design</span> collection
              inspira-se no espírito intemporal do guerreiro: determinado, irreverente e com
              identidade. Criamos peças com personalidade própria.
            </p>
            <p>
              Criada para quem não se contenta com menos. Vestida por quem abre caminho.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-sm mx-auto">
            {[
              { value: '100%', label: 'Algodão premium' },
              { value: 'PT', label: 'Feito em Portugal' },
              { value: '∞', label: 'Edições limitadas' },
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
