'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Shield } from 'lucide-react';

const links = [
  { href: '#inicio', label: 'Início' },
  { href: '#achilles-design', label: 'Coleção' },
  { href: '#about', label: 'Sobre' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/90 backdrop-blur-md border-b border-brand-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="#inicio" className="flex items-center group">
            <span className="text-2xl font-serif font-bold tracking-widest text-white group-hover:text-gold transition-colors duration-200">
              T<span className="text-gold">C</span>lothes
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-xs font-medium tracking-widest uppercase text-brand-muted hover:text-gold transition-colors duration-200">
                {link.label}
              </Link>
            ))}
            <Link
              href="/admin/login"
              className="flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase text-brand-muted/60 hover:text-brand-muted transition-colors duration-200"
            >
              <Shield size={12} />
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-brand-muted hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-black/95 backdrop-blur-md border-t border-brand-border px-4 py-6 flex flex-col space-y-4">
          <Link
            href="#inicio"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-sm font-medium tracking-widest uppercase text-brand-muted hover:text-gold transition-colors"
          >
            Início
          </Link>
          {links.slice(1).map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium tracking-widest uppercase text-brand-muted hover:text-gold transition-colors">
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin/login"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-1.5 text-xs font-medium tracking-wider uppercase text-brand-muted/60 hover:text-brand-muted transition-colors"
          >
            <Shield size={12} />
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
