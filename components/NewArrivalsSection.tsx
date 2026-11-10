import Image from 'next/image';

const arrivals = [
  { name: 'T-shirt Achilles azul-marinho', category: 'T-shirt', image: '/products/tshirt-azul-marinho.png', alt: 'T-shirt azul-marinho com emblema Achilles vermelho' },
  { name: 'T-shirt Achilles branca', category: 'T-shirt', image: '/products/tshirt-branca.png', alt: 'T-shirt branca com emblema Achilles azul' },
  { name: 'Casaco Achilles azul-marinho', category: 'Casaco com capuz', image: '/products/jaqueta-azul-marinho.png', alt: 'Casaco azul-marinho com fecho e emblema Achilles vermelho' },
];

export default function NewArrivalsSection() {
  return (
    <section id="novidades" className="bg-brand-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-gold">Novidades</p>
          <h2 className="mb-5 font-serif text-4xl font-bold text-white md:text-6xl">A próxima coleção</h2>
          <p className="mx-auto max-w-xl leading-relaxed text-brand-muted">Conheça as primeiras peças Achilles Design. A coleção chega a 20 de novembro de 2026.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {arrivals.map((item) => (
            <article key={item.image} className="group overflow-hidden border border-brand-border bg-brand-card transition-colors hover:border-gold/40">
              <div className="relative aspect-[4/5] overflow-hidden bg-white">
                <Image src={item.image} alt={item.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain p-3 transition-transform duration-500 group-hover:scale-[1.03]" />
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-brand-border p-5">
                <div><p className="mb-1 text-[10px] uppercase tracking-[0.25em] text-gold/70">{item.category}</p><h3 className="font-serif text-lg text-white">{item.name}</h3></div>
                <span className="shrink-0 border border-gold/30 px-2.5 py-1 text-[10px] uppercase tracking-wider text-gold">Em breve</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
