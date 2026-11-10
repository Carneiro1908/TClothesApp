'use client';

import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  Plus,
  LogOut,
  RefreshCw,
  Package,
  ShoppingBag,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import ProductTable, { type Product } from '@/components/admin/ProductTable';
import ProductModal from '@/components/admin/ProductModal';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setError('Failed to load products. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  }

  function handleDelete(product: Product) {
    setDeletingProduct(product);
    setIsDeleteModalOpen(true);
  }

  async function handleToggleStatus(product: Product) {
    const newStatus = product.status === 'hidden' ? 'active' : 'hidden';
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, status: newStatus }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
        );
      }
    } catch {
      // Handle silently
    }
  }

  function handleAddProduct() {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  }

  // Stats
  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === 'active').length,
    hidden: products.filter((p) => p.status === 'hidden').length,
    comingSoon: products.filter((p) => p.status === 'coming_soon').length,
  };

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar */}
      <aside className="w-60 bg-brand-surface border-r border-brand-border flex flex-col shrink-0 hidden md:flex">
        {/* Logo */}
        <div className="p-6 border-b border-brand-border">
          <Link href="/" className="inline-block">
            <span className="text-xl font-serif font-bold tracking-widest text-white">
              T<span className="text-gold">C</span>lothes
            </span>
          </Link>
          <p className="text-xs text-brand-muted mt-1 tracking-wide">Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4">
          <p className="text-xs font-medium tracking-[0.3em] uppercase text-brand-muted/50 mb-3 px-2">
            Management
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gold/10 border border-gold/20 text-gold text-sm font-medium rounded-sm">
              <ShoppingBag size={15} />
              Products
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-brand-border space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-brand-muted hover:text-white transition-colors"
          >
            <Package size={13} />
            View Store
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center gap-2 px-3 py-2 text-xs text-brand-muted hover:text-red-400 transition-colors w-full text-left"
          >
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-brand-surface border-b border-brand-border px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          {/* Mobile logo */}
          <div className="md:hidden">
            <span className="text-lg font-serif font-bold tracking-widest text-white">
              T<span className="text-gold">C</span>lothes
            </span>
          </div>

          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-white">Products</h1>
            <p className="text-xs text-brand-muted">
              {stats.total} total · {stats.active} active
            </p>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Link href="/admin/security" className="flex items-center gap-2 border border-brand-border px-3 py-2 text-sm text-brand-muted transition-colors hover:border-gold/40 hover:text-white" title="Authenticator settings">
              <ShieldCheck size={15} />
              <span className="hidden sm:inline">Security</span>
            </Link>
            <button
              onClick={fetchProducts}
              disabled={isLoading}
              className="p-2 text-brand-muted hover:text-white transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleAddProduct}
              className="flex items-center gap-2 bg-gold text-black text-sm font-semibold tracking-wide px-4 py-2 hover:bg-gold-light transition-colors"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Add Product</span>
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              className="md:hidden p-2 text-brand-muted hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Products', value: stats.total, icon: Package, color: 'text-white' },
              { label: 'Active', value: stats.active, icon: Eye, color: 'text-green-400' },
              { label: 'Coming Soon', value: stats.comingSoon, icon: RefreshCw, color: 'text-gold' },
              { label: 'Hidden', value: stats.hidden, icon: EyeOff, color: 'text-brand-muted' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-brand-surface border border-brand-border p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-brand-muted tracking-wide">{stat.label}</p>
                  <stat.icon size={14} className={stat.color} />
                </div>
                <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 mb-6">
              {error}
            </div>
          )}

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-brand-muted">
              <Loader2 size={24} className="animate-spin mr-3" />
              Loading products...
            </div>
          ) : (
            <ProductTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={fetchProducts}
        editProduct={editingProduct}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        product={deletingProduct}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProduct(null);
        }}
        onConfirm={fetchProducts}
      />
    </div>
  );
}
