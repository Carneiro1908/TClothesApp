import Image from 'next/image';
import { Clock } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  status: 'active' | 'coming_soon' | 'hidden';
}

interface PlaceholderCategory {
  name: string;
  label: string;
  comingSoon: true;
}

type CardItem = Product | PlaceholderCategory;

function isPlaceholder(item: CardItem): item is PlaceholderCategory {
  return 'comingSoon' in item;
}

interface ProductCardProps {
  item: CardItem;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

const categoryLabels: Record<string, string> = {
  tshirts: 'T-Shirt',
  hoodies: 'Hoodie / Moleton',
  windbreakers: 'Windbreaker / Quispo',
  pants: 'Pants / Calças',
};

export default function ProductCard({ item }: ProductCardProps) {
  if (isPlaceholder(item)) {
    return (
      <div className="relative group bg-brand-card border border-brand-border overflow-hidden">
        {/* Placeholder image area */}
        <div className="aspect-[3/4] bg-brand-surface flex items-center justify-center relative overflow-hidden">
          {/* Pattern background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(201,168,76,0.3) 10px,
                rgba(201,168,76,0.3) 11px
              )`,
            }}
          />
          <span className="relative text-5xl font-serif font-bold text-brand-border tracking-widest">
            {item.name.charAt(0)}
          </span>

          {/* Coming Soon badge */}
          <div className="absolute top-4 right-4">
            <span className="flex items-center gap-1.5 bg-gold/10 border border-gold/30 text-gold text-xs font-medium tracking-widest uppercase px-3 py-1.5">
              <Clock size={11} />
              Coming Soon
            </span>
          </div>

          {/* Diagonal ribbon */}
          <div className="absolute -top-1 -left-1 w-24 h-24 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
              <div
                className="absolute bg-gold/20 text-gold text-[9px] font-bold tracking-widest uppercase text-center"
                style={{
                  width: '120px',
                  top: '20px',
                  left: '-30px',
                  transform: 'rotate(-45deg)',
                  padding: '3px 0',
                }}
              >
                Em Breve
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 border-t border-brand-border">
          <p className="text-xs font-medium tracking-widest uppercase text-brand-muted mb-1">
            {categoryLabels[item.name] || item.label}
          </p>
          <h3 className="text-base font-serif font-semibold text-white/50 mb-3">
            {item.label}
          </h3>
          <div className="h-px gold-line mb-3" />
          <p className="text-xs text-brand-muted/60 tracking-wide">
            New collection arriving soon. Stay tuned.
          </p>
        </div>
      </div>
    );
  }

  // Real product card
  return (
    <div className="relative group bg-brand-card border border-brand-border overflow-hidden hover:border-gold/30 transition-colors duration-300">
      {/* Product image */}
      <div className="aspect-[3/4] bg-brand-surface relative overflow-hidden">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-serif font-bold text-brand-border">
              T
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-xs font-medium tracking-widest uppercase text-white border border-white/40 px-6 py-2.5 hover:bg-white/10 transition-colors cursor-pointer">
            View Details
          </span>
        </div>
      </div>

      {/* Product info */}
      <div className="p-4 border-t border-brand-border">
        <p className="text-xs font-medium tracking-widest uppercase text-gold/70 mb-1">
          {categoryLabels[item.category] || item.category}
        </p>
        <h3 className="text-sm font-semibold text-white leading-tight mb-3 line-clamp-2">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs text-brand-muted leading-relaxed mb-3 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="h-px gold-line mb-3" />
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gold">
            {formatPrice(item.price)}
          </span>
          <span className="text-xs font-medium tracking-wider uppercase text-brand-muted/60 bg-brand-surface border border-brand-border px-2 py-1">
            Available
          </span>
        </div>
      </div>
    </div>
  );
}
