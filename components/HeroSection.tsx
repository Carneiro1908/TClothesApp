'use client';

import { ChevronDown } from 'lucide-react';

export default function HeroSection() {
  const handleScroll = () => {
    document.getElementById('achilles-design')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-bg">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px gold-line" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px gold-line" />

      {/* Ambient gold glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
        style={{
          background: 'radial-gradient(circle, #C9A84C 0%, transparent 70%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto animate-fade-in">
        {/* Pre-heading */}
        <p className="text-xs font-medium tracking-[0.4em] uppercase text-gold mb-6 opacity-80">
          Achilles Design · Streetwear premium
        </p>

        {/* Main brand name */}
        <h1 className="font-serif text-[clamp(4rem,15vw,12rem)] font-bold leading-none tracking-tight text-white mb-6">
          T<span className="text-gold">Clothes</span>
        </h1>

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-16 bg-gold/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-gold" />
          <div className="h-px w-16 bg-gold/40" />
        </div>

        {/* Tagline */}
        <p className="text-lg md:text-xl font-light tracking-[0.2em] uppercase text-white/60 mb-4">
          Vista a lenda
        </p>
        <p className="text-sm text-brand-muted max-w-md mx-auto leading-relaxed">
          Peças criadas com rigor para quem exige mais. Onde a cultura urbana encontra qualidade sem concessões.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleScroll}
            className="px-8 py-3.5 bg-gold text-black text-sm font-semibold tracking-widest uppercase hover:bg-gold-light transition-colors duration-200"
          >
            Explorar coleção
          </button>
          <button
            onClick={() =>
              document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
            }
            className="px-8 py-3.5 border border-brand-border text-sm font-medium tracking-widest uppercase text-brand-muted hover:border-gold/40 hover:text-white transition-colors duration-200"
          >
            A nossa história
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={handleScroll}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-brand-muted hover:text-gold transition-colors animate-bounce-slow"
        aria-label="Scroll down"
      >
        <span className="text-xs tracking-widest uppercase">Scroll</span>
        <ChevronDown size={18} />
      </button>
    </section>
  );
}
