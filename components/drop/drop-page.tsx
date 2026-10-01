import { ProductCard } from "./product-card"

// Contenu de la page d'accueil, caché sous les couvertures.
// Deux versions : ordinateur (maquette Figma, cadre 1440 × 753, nœud 5896:9797)
// et mobile (cadre 390 × 780). Le bureau choisit laquelle afficher (data-layout).
// Les attributs data-reveal servent à l'animation d'intro (voir paper-desk.tsx).

const label = "absolute font-display text-[10px] leading-none text-black uppercase whitespace-nowrap"
const manifesto = "absolute bg-black px-4 py-2 font-display text-[10px] leading-none text-white uppercase"
const title = "absolute -translate-x-1/2 text-center font-display leading-none whitespace-nowrap text-black uppercase"

const products = [
  { name: "Military Jacket", price: "$150" },
  { name: "Brassard", price: "$30" },
]

function DesktopLayout() {
  return (
    <div className="absolute inset-0 group-data-[layout=mobile]/stage:hidden">
      {/* En-tête */}
      <p data-reveal="header" className={`${label} top-[56px] left-[223.5px] -translate-x-1/2`}>Military drop</p>
      <p data-reveal="header" className={`${label} top-[56px] left-[508px] -translate-x-full`}>September 2026</p>
      <button data-reveal="header" type="button" className={`${manifesto} top-[47px] left-[864px]`}>
        Manifesto
      </button>
      <p data-reveal="header" className={`${label} top-[56px] left-[1283px] -translate-x-full`}>September 2026</p>

      {/* Titre */}
      <h1 data-reveal="title" className={`${title} top-[94.03px] left-[719.68px] text-[120px]`}>
        Did the war end
        <br />
        or did we scroll
      </h1>

      {/* Produits */}
      {products.map((p, i) => (
        <ProductCard key={p.name} {...p} left={400 + i * 340} top={360} size={300} priceLeft={115} />
      ))}
    </div>
  )
}

function MobileLayout() {
  return (
    <div className="absolute inset-0 hidden group-data-[layout=mobile]/stage:block">
      {/* En-tête */}
      <p data-reveal="header" className={`${label} top-[30px] left-[16px]`}>Military drop</p>
      <p data-reveal="header" className={`${label} top-[30px] left-[195px] -translate-x-1/2`}>September 2026</p>
      <button data-reveal="header" type="button" className={`${manifesto} top-[21px] right-[16px]`}>
        Manifesto
      </button>

      {/* Titre */}
      <h1 data-reveal="title" className={`${title} top-[76px] left-[195px] text-[56px]`}>
        Did the war
        <br />
        end or did
        <br />
        we scroll
      </h1>

      {/* Produits */}
      {products.map((p, i) => (
        <ProductCard key={p.name} {...p} left={16 + i * 187} top={270} size={171} priceLeft={95} />
      ))}
    </div>
  )
}

export function DropPage() {
  return (
    <div className="relative size-full">
      <DesktopLayout />
      <MobileLayout />
    </div>
  )
}
