import { ProductCard } from "./product-card"

// Contenu de la page d'accueil, caché sous les couvertures.
// Positions reprises de la maquette Figma (cadre 1440 × 753, nœud 5896:9797).
// Les attributs data-reveal servent à l'animation d'intro (voir paper-desk.tsx).

const label = "absolute font-display text-[10px] leading-none text-black uppercase whitespace-nowrap"

const products = [
  { name: "Military Jacket", price: "$150", left: 400 },
  { name: "Brassard", price: "$30", left: 740 },
]

export function DropPage() {
  return (
    <div className="relative size-full">
      {/* En-tête */}
      <p data-reveal="header" className={`${label} top-[56px] left-[223.5px] -translate-x-1/2`}>Military drop</p>
      <p data-reveal="header" className={`${label} top-[56px] left-[508px] -translate-x-full`}>September 2026</p>
      <button
        data-reveal="header"
        type="button"
        className="absolute top-[47px] left-[864px] bg-black px-4 py-2 font-display text-[10px] leading-none text-white uppercase"
      >
        Manifesto
      </button>
      <p data-reveal="header" className={`${label} top-[56px] left-[1283px] -translate-x-full`}>September 2026</p>

      {/* Titre */}
      <h1 data-reveal="title" className="absolute top-[94.03px] left-[719.68px] -translate-x-1/2 text-center font-display text-[120px] leading-none whitespace-nowrap text-black uppercase">
        Did the war end
        <br />
        or did we scroll
      </h1>

      {/* Produits */}
      {products.map((p) => (
        <ProductCard key={p.name} {...p} />
      ))}
    </div>
  )
}
