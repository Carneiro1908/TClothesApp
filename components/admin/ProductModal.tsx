'use client';

import { useState, useEffect, FormEvent } from 'react';
import { X, Loader2, AlertCircle, Upload, FileText } from 'lucide-react';
import type { Product } from './ProductTable';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editProduct?: Product | null;
}

type FormData = {
  name: string;
  category: 'tshirts' | 'hoodies' | 'windbreakers' | 'pants';
  description: string;
  price: string;
  image_url: string;
  status: 'active' | 'coming_soon' | 'hidden';
};

const DEFAULT_FORM: FormData = {
  name: '',
  category: 'tshirts',
  description: '',
  price: '',
  image_url: '',
  status: 'active',
};

interface FieldError {
  _errors: string[];
}

interface FormErrors {
  fieldErrors?: {
    name?: FieldError;
    category?: FieldError;
    description?: FieldError;
    price?: FieldError;
    image_url?: FieldError;
    status?: FieldError;
  };
  formErrors?: string[];
}

export default function ProductModal({
  isOpen,
  onClose,
  onSuccess,
  editProduct,
}: ProductModalProps) {
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name,
        category: editProduct.category,
        description: editProduct.description || '',
        price: editProduct.price.toString(),
        image_url: editProduct.image_url || '',
        status: editProduct.status,
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrors({});
    setServerError('');
    setImageFile(null);
    setImagePreview('');
  }, [editProduct, isOpen]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setServerError('');
    setIsLoading(true);

    try {
      const payload = new FormData();
      payload.set('name', form.name);
      payload.set('category', form.category);
      payload.set('description', form.description.trim());
      payload.set('price', form.price);
      payload.set('image_url', form.image_url);
      payload.set('status', form.status);
      if (imageFile) payload.set('image', imageFile);

      const url = editProduct
        ? `/api/admin/products/${editProduct.id}`
        : '/api/admin/products';
      const method = editProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: payload,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          setErrors(data.details);
        } else {
          setServerError(data.error || 'Something went wrong');
        }
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  const getFieldError = (field: keyof NonNullable<FormErrors['fieldErrors']>) => {
    return errors.fieldErrors?.[field]?._errors?.[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-brand-surface border border-brand-border shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border shrink-0">
          <div>
            <h2 className="text-base font-semibold text-white">
              {editProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-brand-muted mt-0.5">
              {editProduct ? 'Update product details' : 'Fill in the product information'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-brand-muted hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
            {/* Server error */}
            {serverError && (
              <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium tracking-widest uppercase text-brand-muted">
                Product Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                className={`w-full bg-brand-card border text-white text-sm px-3 py-2.5 focus:outline-none transition-colors ${
                  getFieldError('name')
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-brand-border focus:border-gold/50'
                }`}
                placeholder="e.g. TClothes Classic Black Tee"
              />
              {getFieldError('name') && (
                <p className="text-xs text-red-400">{getFieldError('name')}</p>
              )}
            </div>

            {/* Category + Status row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium tracking-widest uppercase text-brand-muted">
                  Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      category: e.target.value as FormData['category'],
                    }))
                  }
                  className="w-full bg-brand-card border border-brand-border text-white text-sm px-3 py-2.5 focus:outline-none focus:border-gold/50 transition-colors appearance-none"
                >
                  <option value="tshirts">T-Shirts</option>
                  <option value="hoodies">Hoodies</option>
                  <option value="windbreakers">Windbreakers</option>
                  <option value="pants">Pants</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium tracking-widest uppercase text-brand-muted">
                  Status *
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as FormData['status'],
                    }))
                  }
                  className="w-full bg-brand-card border border-brand-border text-white text-sm px-3 py-2.5 focus:outline-none focus:border-gold/50 transition-colors appearance-none"
                >
                  <option value="active">Active</option>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium tracking-widest uppercase text-brand-muted">
                Price (€) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
                min="0.01"
                step="0.01"
                className={`w-full bg-brand-card border text-white text-sm px-3 py-2.5 focus:outline-none transition-colors ${
                  getFieldError('price')
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-brand-border focus:border-gold/50'
                }`}
                placeholder="49.99"
              />
              {getFieldError('price') && (
                <p className="text-xs text-red-400">{getFieldError('price')}</p>
              )}
            </div>

            {/* Product image */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium tracking-widest uppercase text-brand-muted">
                Product Image
              </label>
              <label className="flex cursor-pointer items-center gap-2 border border-brand-border bg-brand-card px-3 py-3 text-sm text-brand-muted hover:border-gold/50 hover:text-white">
                <Upload size={16} />
                <span>{imageFile ? imageFile.name : 'Choose an image or PDF from your device'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.pdf"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);
                    setImagePreview(file ? URL.createObjectURL(file) : '');
                  }}
                />
              </label>
              <p className="text-xs text-brand-muted">JPEG, PNG, WebP, GIF or PDF. Maximum 5 MB.</p>
              {getFieldError('image_url') && (
                <p className="text-xs text-red-400">{getFieldError('image_url')}</p>
              )}
              {(imagePreview || form.image_url) && (imageFile?.type === 'application/pdf' || (!imagePreview && form.image_url.toLowerCase().endsWith('.pdf')) ? (
                <a href={imagePreview || form.image_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 border border-brand-border px-3 py-2 text-xs text-gold hover:border-gold/50">
                  <FileText size={16} /> Open PDF preview
                </a>
              ) : (
                <div className="relative w-16 h-16 mt-2 border border-brand-border overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview || form.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium tracking-widest uppercase text-brand-muted">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={3}
                className="w-full bg-brand-card border border-brand-border text-white text-sm px-3 py-2.5 focus:outline-none focus:border-gold/50 transition-colors resize-none"
                placeholder="Describe the product..."
              />
              {getFieldError('description') && (
                <p className="text-xs text-red-400">{getFieldError('description')}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-brand-border flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2 text-sm text-brand-muted border border-brand-border hover:border-brand-muted/50 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gold text-black text-sm font-semibold tracking-wide hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : editProduct ? (
                'Update Product'
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
