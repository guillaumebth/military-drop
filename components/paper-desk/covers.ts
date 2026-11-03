// Position de chaque couverture au chargement, dans le cadre de la maquette.
// Les feuilles sont réparties tout autour de la page, en laissant le centre libre.
// x / y = centre de la feuille, w / h = taille de la feuille, rotation en degrés.
// L'ordre du tableau = ordre d'empilement (la dernière est au-dessus).

// Deux mises en page : ordinateur (maquette Figma) et mobile (écran < 768 px de large).
export type Layout = "desktop" | "mobile"

export const LAYOUTS: Record<Layout, { width: number; height: number; sheetScale: number }> = {
  desktop: { width: 1440, height: 800, sheetScale: 0.85 },
  mobile: { width: 390, height: 780, sheetScale: 0.43 },
}

export const MOBILE_BREAKPOINT = 768

// Articles autour de la page : passer à false pour les masquer
export const SHOW_COVERS = true

type Placement = { x: number; y: number; rotation: number }

export type Cover = Placement & {
  src: string
  alt: string
  w: number
  h: number
  mobile: Placement
}

export const covers: Cover[] = [
  { src: "/fronts/cover-6.webp", alt: "Daily Mail — Putin to seize capital in days", x: 150, y: 690, w: 250, h: 325, rotation: -5, mobile: { x: 15, y: 590, rotation: -6 } },
  { src: "/fronts/cover-3.webp", alt: "New York Post — This is a dictator", x: 120, y: 190, w: 240, h: 270, rotation: -7, mobile: { x: 10, y: 265, rotation: -8 } },
  { src: "/fronts/cover-10.webp", alt: "Scottish Daily Mail — Kyiv, the city of courage", x: 90, y: 480, w: 208, h: 265, rotation: 6, mobile: { x: 8, y: 400, rotation: 6 } },
  { src: "/fronts/cover-7.webp", alt: "The New York Times — War in Ukraine", x: 1130, y: 300, w: 294, h: 100, rotation: -3, mobile: { x: 20, y: 735, rotation: -3 } },
  { src: "/fronts/cover-4.webp", alt: "How much more?", x: 400, y: 690, w: 200, h: 194, rotation: 4, mobile: { x: 195, y: 792, rotation: 3 } },
  { src: "/fronts/cover-8.webp", alt: "The Guardian — Putin invades", x: 320, y: 300, w: 221, h: 91, rotation: 5, mobile: { x: 375, y: 215, rotation: 6 } },
  { src: "/fronts/cover-2.webp", alt: "The Times — Battle to save Kyiv", x: 1340, y: 480, w: 188, h: 242, rotation: -6, mobile: { x: 380, y: 540, rotation: -6 } },
  { src: "/fronts/cover-1.webp", alt: "Daily News — Russia launches Ukraine attack", x: 1330, y: 205, w: 204, h: 272, rotation: 8, mobile: { x: 385, y: 370, rotation: 8 } },
  { src: "/fronts/cover-9.webp", alt: "The Sunday Times — Putin wipes out entire city", x: 1200, y: 680, w: 317, h: 225, rotation: 5, mobile: { x: 378, y: 730, rotation: 5 } },
]
