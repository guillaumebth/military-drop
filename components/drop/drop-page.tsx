import Image from "next/image"

import { Brassard } from "@/components/brassard/brassard"

// Contenu de la page d'accueil. Deux versions : ordinateur (maquette Figma, cadre 1440 × 800,
// nœud 58:137) et mobile (cadre 390 × 780). Les positions horizontales sont en % de l'écran,
// le bouton est calé sur le bas : la page occupe tout l'écran quelles que soient ses proportions. Le bureau choisit laquelle afficher (data-layout).
// Les attributs data-reveal servent à l'animation d'intro (voir paper-desk.tsx).

const label = "absolute font-display text-[10px] font-bold leading-none text-ink uppercase whitespace-nowrap"
const manifesto = "absolute bg-chip px-4 py-2 font-display text-[10px] font-bold leading-none text-ink uppercase"
const title =
  "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col text-center font-title font-medium leading-[0.98] whitespace-pre text-ink uppercase"
const accent = "pl-[0.14em] font-bold italic"

// Chaque ligne glisse depuis son propre masque ; la marge du masque laisse dépasser l'italique
const titleMask = "-mx-[0.2em] -my-[0.12em] block overflow-clip px-[0.2em] py-[0.12em]"

function Title({ className }: { className: string }) {
  return (
    <h1 data-reveal="title" className={`${title} ${className}`}>
      <span className={titleMask}>
        <span data-title-line className="block">
          Did<span className={accent}>the war end</span>
        </span>
      </span>
      <span className={titleMask}>
        <span data-title-line className="block">
          or did<span className={accent}>we scroll?</span>
        </span>
      </span>
    </h1>
  )
}

// Repère de cadrage : un angle tourné selon sa position autour du bouton
function Corner({ left, top, rotate }: { left: number; top: number; rotate: number }) {
  return (
    <div className="absolute size-3" style={{ left, top, transform: `rotate(${rotate}deg)` }}>
      <Image src="/ui/corner.svg" alt="" width={12} height={13} className="absolute top-0 left-0 max-w-none" />
    </div>
  )
}

// Prix + bouton d'achat, encadrés par les 4 repères : centrés, à 140 px du bas de l'écran.
function BuyBlock() {
  return (
    <div
      data-reveal="cta"
      className="absolute"
      style={{ left: "calc(50% - 92px)", top: "calc(100% - 140px)", width: 184, height: 63 }}
    >
      <p className="absolute top-0 left-[92px] -translate-x-1/2 font-display text-[13px] font-bold leading-none text-ink uppercase">
        $14,99
      </p>
      <button
        type="button"
        className="absolute top-[21px] left-3 flex h-[29px] w-[159px] items-center justify-center bg-ink px-4 font-display text-[10px] font-bold leading-none text-white uppercase"
      >
        Buy
      </button>
      <p className="absolute top-[72px] left-[92px] -translate-x-1/2 font-display text-[9px] font-bold leading-none whitespace-nowrap text-ink uppercase">
        100% of the profits fund Ukrainian NGOs
      </p>
      <Corner left={171} top={9} rotate={0} />
      <Corner left={0} top={9} rotate={-90} />
      <Corner left={1} top={51} rotate={180} />
      <Corner left={172} top={51} rotate={90} />
    </div>
  )
}

function DesktopLayout() {
  return (
    <div className="absolute inset-0 group-data-[layout=mobile]/stage:hidden">
      {/* En-tête */}
      <p data-reveal="header" className={`${label} top-[25px] left-[19.3%] -translate-x-full`}>QSTNMRK</p>
      <p data-reveal="header" className={`${label} top-[25px] left-[35.3%] -translate-x-full`}>Did we scroll</p>
      <button data-reveal="header" type="button" className={`${manifesto} top-4 left-[60%]`}>
        Manifesto
      </button>
      <p data-reveal="header" className={`${label} top-[25px] left-[89.1%] -translate-x-full`}>2022 - 20??</p>

      {/* Titre */}
      <Title className="top-[159.29px] left-1/2 text-[56.644px] tracking-[-1.1329px]" />
      <p data-reveal="tagline" className={`${label} top-[224px] left-1/2 -translate-x-1/2`}>
        a easy to wear object so we don&apos;t forget
      </p>

      <BuyBlock />
    </div>
  )
}

function MobileLayout() {
  return (
    <div className="absolute inset-0 hidden group-data-[layout=mobile]/stage:block">
      {/* En-tête */}
      <p data-reveal="header" className={`${label} top-[25px] left-4`}>QSTNMRK</p>
      <p data-reveal="header" className={`${label} top-[25px] left-[36%]`}>Did we scroll</p>
      <button data-reveal="header" type="button" className={`${manifesto} top-4 right-4`}>
        Manifesto
      </button>

      {/* Titre */}
      <Title className="top-[108px] left-1/2 text-[36px] tracking-[-0.72px]" />
      <p data-reveal="tagline" className={`${label} top-[158px] left-1/2 -translate-x-1/2`}>
        a easy to wear object so we don&apos;t forget
      </p>

      <BuyBlock />
    </div>
  )
}

export function DropPage() {
  return (
    <div className="relative size-full">
      <Brassard />
      <DesktopLayout />
      <MobileLayout />
    </div>
  )
}
