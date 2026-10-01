// Position de chaque couverture au chargement, dans le cadre de la maquette.
// Les feuilles sont réparties sur les bords pour laisser voir le site au centre.
// x / y = centre de la feuille, w / h = taille de la feuille, rotation en degrés.
// L'ordre du tableau = ordre d'empilement (la dernière est au-dessus).

// Deux mises en page : ordinateur (maquette Figma) et mobile (écran < 768 px de large).
export type Layout = "desktop" | "mobile"

export const LAYOUTS: Record<Layout, { width: number; height: number; sheetScale: number }> = {
  desktop: { width: 1440, height: 753, sheetScale: 1 },
  mobile: { width: 390, height: 780, sheetScale: 0.5 },
}

export const MOBILE_BREAKPOINT = 768

type Placement = { x: number; y: number; rotation: number }

export type Cover = Placement & {
  src: string
  alt: string
  w: number
  h: number
  mobile: Placement
}

export const covers: Cover[] = [
  { src: "/covers/cover-3.png", alt: "New York Post — This is a dictator", x: 150, y: 140, w: 385, h: 432, rotation: -8, mobile: { x: 18, y: 130, rotation: -10 } },
  { src: "/covers/cover-1.jpg", alt: "Daily News — Russia launches Ukraine attack", x: 110, y: 640, w: 293, h: 390, rotation: 22, mobile: { x: 40, y: 650, rotation: 18 } },
  { src: "/covers/cover-4.png", alt: "How much more?", x: 1300, y: 130, w: 323, h: 309, rotation: 9, mobile: { x: 372, y: 120, rotation: 12 } },
  { src: "/covers/cover-2.png", alt: "Battle to save Kyiv", x: 330, y: 770, w: 223, h: 286, rotation: -6, mobile: { x: 205, y: 770, rotation: -6 } },
  { src: "/covers/cover-5.png", alt: "Daily Mail — Kyiv, the city of courage", x: 1345, y: 580, w: 333, h: 426, rotation: -18, mobile: { x: 350, y: 660, rotation: -16 } },
  { src: "/covers/cover-6.jpg", alt: "Daily Mail — Putin to seize capital in days", x: 1195, y: 610, w: 342, h: 447, rotation: 12, mobile: { x: 265, y: 640, rotation: 10 } },
  { src: "/covers/cover-7.jpg", alt: "The New York Times — War in Ukraine", x: 620, y: 785, w: 490, h: 166, rotation: 2, mobile: { x: 110, y: 560, rotation: -4 } },
  { src: "/covers/cover-8.jpg", alt: "The Guardian — Putin invades", x: 215, y: 335, w: 392, h: 162, rotation: -5, mobile: { x: 310, y: 545, rotation: 5 } },
  { src: "/covers/cover-9.jpg", alt: "The Sunday Times — Putin wipes out entire city", x: 140, y: 470, w: 444, h: 316, rotation: 6, mobile: { x: 120, y: 730, rotation: 6 } },
]
