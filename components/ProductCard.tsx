'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FileText } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  image_urls?: string[];
  status: 'active' | 'coming_soon' | 'hidden';
}

interface ProductCardProps {
  item: Product;
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const images = item.image_urls?.length ? item.image_urls : item.image_url ? [item.image_url] : [];
  const activeImage = images[Math.min(activeImageIndex, images.length - 1)];

  // Real product card
  return (
    <div className="relative group bg-brand-card border border-brand-border overflow-hidden hover:border-gold/30 transition-colors duration-300">
      {/* Product image */}
      <div className="aspect-[3/4] bg-brand-surface relative overflow-hidden">
        {activeImage?.toLowerCase().endsWith('.pdf') ? (
          <a href={activeImage} target="_blank" rel="noreferrer" className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gold hover:bg-white/5" aria-label={`Open ${item.name} PDF`}>
            <FileText size={48} strokeWidth={1.25} />
            <span className="text-xs font-medium uppercase tracking-widest">Open product PDF</span>
          </a>
        ) : activeImage ? (
          <Image
            src={activeImage}
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
        <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-xs font-medium tracking-widest uppercase text-white border border-white/40 px-6 py-2.5 hover:bg-white/10 transition-colors cursor-pointer">
            View Details
          </span>
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-2">
            {images.map((url, index) => (
              <button key={url} type="button" onClick={() => setActiveImageIndex(index)} aria-label={`Show product option ${index + 1}`} aria-pressed={index === activeImageIndex} className={`h-10 w-10 overflow-hidden border-2 bg-brand-card ${index === activeImageIndex ? 'border-gold' : 'border-white/50'}`}>
                {url.toLowerCase().endsWith('.pdf') ? <FileText size={18} className="mx-auto text-gold" /> : <Image src={url} alt="" width={40} height={40} className="h-full w-full object-cover" />}
              </button>
            ))}
          </div>
        )}
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
