import { Instagram } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-bg border-t border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-serif font-bold tracking-widest text-white">
                T<span className="text-gold">C</span>lothes
              </span>
            </Link>
            <p className="text-sm text-brand-muted leading-relaxed max-w-xs">
              Premium streetwear built on the foundation of Achilles Design — strength,
              style, and legacy in every thread.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.3em] uppercase text-gold mb-6">
              Navigate
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#achilles-design"
                  className="text-sm text-brand-muted hover:text-white transition-colors"
                >
                  Achilles Design
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-sm text-brand-muted hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.3em] uppercase text-gold mb-6">
              Connect
            </h4>
            <div className="space-y-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-brand-muted hover:text-white transition-colors"
              >
                <Instagram size={14} />
                @tclothes
              </a>
            </div>
          </div>
        </div>

        {/* Gold divider */}
        <div className="gold-line" />

        {/* Bottom bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-muted tracking-wide">
            © {year} TClothes. All rights reserved.
          </p>
          <p className="text-xs text-brand-muted/40 tracking-widest uppercase">
            Achilles Design
          </p>
        </div>
      </div>
    </footer>
  );
}
