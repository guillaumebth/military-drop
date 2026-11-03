// Position de chaque couverture au chargement, dans le cadre de la maquette.
// Les feuilles forment une frise en bas de page, coupée par le bord de l'écran.
// x / y = centre de la feuille, w / h = taille de la feuille, rotation en degrés.
// L'ordre du tableau = ordre d'empilement (la dernière est au-dessus).

// Deux mises en page : ordinateur (maquette Figma) et mobile (écran < 768 px de large).
export type Layout = "desktop" | "mobile"

export const LAYOUTS: Record<Layout, { width: number; height: number; sheetScale: number }> = {
  desktop: { width: 1440, height: 800, sheetScale: 1 },
  mobile: { width: 390, height: 780, sheetScale: 0.6 },
}

export const MOBILE_BREAKPOINT = 768

// Articles masqués pour le moment : repasser à true pour les faire revenir
export const SHOW_COVERS = false

type Placement = { x: number; y: number; rotation: number }

export type Cover = Placement & {
  src: string
  alt: string
  w: number
  h: number
  mobile: Placement
}

export const covers: Cover[] = [
  { src: "/fronts/cover-6.webp", alt: "Daily Mail — Putin to seize capital in days", x: 809, y: 797, w: 192, h: 250, rotation: 0, mobile: { x: 205, y: 690, rotation: 0 } },
  { src: "/fronts/cover-3.webp", alt: "New York Post — This is a dictator", x: 92.56, y: 733, w: 185.12, h: 208, rotation: 0, mobile: { x: 48, y: 672, rotation: 0 } },
  { src: "/fronts/cover-10.webp", alt: "Scottish Daily Mail — Kyiv, the city of courage", x: 445, y: 759, w: 160, h: 204, rotation: 0, mobile: { x: 150, y: 690, rotation: 0 } },
  { src: "/fronts/cover-7.webp", alt: "The New York Times — War in Ukraine", x: 620, y: 782.5, w: 226, h: 77, rotation: 0, mobile: { x: 180, y: 738, rotation: 0 } },
  { src: "/fronts/cover-4.webp", alt: "How much more?", x: 271.5, y: 746.5, w: 155, h: 149, rotation: 0, mobile: { x: 95, y: 705, rotation: 0 } },
  { src: "/fronts/cover-8.webp", alt: "The Guardian — Putin invades", x: 975, y: 731, w: 170, h: 70, rotation: 0, mobile: { x: 262, y: 650, rotation: 0 } },
  { src: "/fronts/cover-2.webp", alt: "The Times — Battle to save Kyiv", x: 1132.5, y: 735, w: 145, h: 186, rotation: 0, mobile: { x: 300, y: 690, rotation: 0 } },
  { src: "/fronts/cover-1.webp", alt: "Daily News — Russia launches Ukraine attack", x: 1293.5, y: 786.5, w: 157, h: 209, rotation: 0, mobile: { x: 352, y: 702, rotation: 0 } },
  { src: "/fronts/cover-9.webp", alt: "The Sunday Times — Putin wipes out entire city", x: 1482, y: 774.5, w: 244, h: 173, rotation: 0, mobile: { x: 402, y: 722, rotation: 0 } },
]
