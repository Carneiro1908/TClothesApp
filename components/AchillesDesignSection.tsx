import ProductCard from './ProductCard';

interface Product {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  status: 'active' | 'coming_soon' | 'hidden';
}

interface AchillesDesignSectionProps {
  products: Product[];
}

export default function AchillesDesignSection({ products }: AchillesDesignSectionProps) {
  const activeProducts = products.filter((p) => p.status === 'active');

  return (
    <section id="achilles-design" className="py-24 md:py-32 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-4">
            Exclusive Collection
          </p>
          <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6">
            Achilles Design
          </h2>
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-20 bg-gold/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            <div className="h-px w-20 bg-gold/40" />
          </div>
          <p className="text-brand-muted max-w-xl mx-auto leading-relaxed">
            Born from the relentless pursuit of excellence. Every piece in the Achilles Design
            collection is crafted to reflect strength, style, and legacy.
          </p>
        </div>

        {/* Category labels */}
        <div className="mb-10">
          <h3 className="text-xs font-medium tracking-[0.3em] uppercase text-gold/60 mb-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-brand-border" />
            T-Shirts — Available Now
            <span className="h-px flex-1 bg-brand-border" />
          </h3>

          {/* T-shirt products grid */}
          {activeProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {activeProducts.map((product) => (
                <ProductCard key={product.id} item={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 mb-16 border border-brand-border">
              <p className="text-brand-muted text-sm">No products available yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
