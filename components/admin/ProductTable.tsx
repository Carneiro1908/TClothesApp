'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Edit2, Trash2, Eye, EyeOff, Package, FileText } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  category: 'tshirts' | 'hoodies' | 'windbreakers' | 'pants';
  description?: string | null;
  price: number;
  image_url?: string | null;
  image_urls?: string[];
  status: 'active' | 'coming_soon' | 'hidden';
  created_at: string;
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
}

const categoryLabels: Record<string, string> = {
  tshirts: 'T-Shirts',
  hoodies: 'Hoodies',
  windbreakers: 'Windbreakers',
  pants: 'Pants',
};

const statusStyles: Record<string, string> = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  coming_soon: 'bg-gold/10 text-gold border-gold/20',
  hidden: 'bg-brand-muted/10 text-brand-muted border-brand-muted/20',
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  onToggleStatus,
}: ProductTableProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  if (products.length === 0) {
    return (
      <div className="text-center py-16 border border-brand-border bg-brand-surface">
        <Package size={40} className="mx-auto text-brand-border mb-4" />
        <p className="text-brand-muted text-sm">No products yet.</p>
        <p className="text-brand-muted/50 text-xs mt-1">
          Click &quot;Add Product&quot; to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-brand-border overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-surface border-b border-brand-border">
              <th className="text-left text-xs font-medium tracking-widest uppercase text-brand-muted px-4 py-3 w-16">
                Image
              </th>
              <th className="text-left text-xs font-medium tracking-widest uppercase text-brand-muted px-4 py-3">
                Name
              </th>
              <th className="text-left text-xs font-medium tracking-widest uppercase text-brand-muted px-4 py-3">
                Category
              </th>
              <th className="text-left text-xs font-medium tracking-widest uppercase text-brand-muted px-4 py-3">
                Price
              </th>
              <th className="text-left text-xs font-medium tracking-widest uppercase text-brand-muted px-4 py-3">
                Status
              </th>
              <th className="text-right text-xs font-medium tracking-widest uppercase text-brand-muted px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {products.map((product) => (
              <tr
                key={product.id}
                className={`bg-brand-card hover:bg-brand-surface transition-colors ${
                  product.status === 'hidden' ? 'opacity-50' : ''
                }`}
              >
                {/* Image */}
                <td className="px-4 py-3">
                  <div className="w-12 h-12 bg-brand-surface border border-brand-border overflow-hidden relative shrink-0">
                    {product.image_url?.toLowerCase().endsWith('.pdf') ? (
                      <a href={product.image_url} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center text-gold" aria-label={`Open ${product.name} PDF`}><FileText size={20} /></a>
                    ) : product.image_url && !imageErrors.has(product.id) ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                        onError={() =>
                          setImageErrors((prev) => new Set(prev).add(product.id))
                        }
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package size={16} className="text-brand-border" />
                      </div>
                    )}
                  </div>
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-white text-sm line-clamp-1">
                      {product.name}
                    </p>
                    {product.description && (
                      <p className="text-xs text-brand-muted line-clamp-1 mt-0.5">
                        {product.description}
                      </p>
                    )}
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  <span className="text-xs text-brand-muted">
                    {categoryLabels[product.category]}
                  </span>
                </td>

                {/* Price */}
                <td className="px-4 py-3">
                  <span className="text-sm font-medium text-gold">
                    {formatPrice(product.price)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-block text-xs font-medium tracking-wide px-2 py-0.5 border ${
                      statusStyles[product.status]
                    }`}
                  >
                    {product.status === 'active'
                      ? 'Active'
                      : product.status === 'coming_soon'
                      ? 'Coming Soon'
                      : 'Hidden'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onToggleStatus(product)}
                      title={product.status === 'hidden' ? 'Show' : 'Hide'}
                      className="p-1.5 text-brand-muted hover:text-white transition-colors rounded"
                    >
                      {product.status === 'hidden' ? (
                        <Eye size={15} />
                      ) : (
                        <EyeOff size={15} />
                      )}
                    </button>
                    <button
                      onClick={() => onEdit(product)}
                      title="Edit"
                      className="p-1.5 text-brand-muted hover:text-gold transition-colors rounded"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(product)}
                      title="Delete"
                      className="p-1.5 text-brand-muted hover:text-red-400 transition-colors rounded"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-brand-border">
        {products.map((product) => (
          <div
            key={product.id}
            className={`p-4 bg-brand-card ${product.status === 'hidden' ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 bg-brand-surface border border-brand-border overflow-hidden relative shrink-0">
                {product.image_url?.toLowerCase().endsWith('.pdf') ? (
                  <a href={product.image_url} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center text-gold" aria-label={`Open ${product.name} PDF`}><FileText size={22} /></a>
                ) : product.image_url && !imageErrors.has(product.id) ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                    onError={() =>
                      setImageErrors((prev) => new Set(prev).add(product.id))
                    }
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package size={18} className="text-brand-border" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{product.name}</p>
                <p className="text-xs text-brand-muted mt-0.5">
                  {categoryLabels[product.category]}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-medium text-gold">
                    {formatPrice(product.price)}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 border ${statusStyles[product.status]}`}
                  >
                    {product.status}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  onClick={() => onEdit(product)}
                  className="p-1.5 text-brand-muted hover:text-gold transition-colors"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => onDelete(product)}
                  className="p-1.5 text-brand-muted hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
