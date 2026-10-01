// Position de chaque couverture au chargement, dans le cadre de la maquette (1440 × 753).
// Les feuilles sont réparties sur les bords pour laisser voir le site au centre.
// x / y = centre de la feuille, w / h = taille de la feuille, rotation en degrés.
// L'ordre du tableau = ordre d'empilement (la dernière est au-dessus).

export const DESK_WIDTH = 1440
export const DESK_HEIGHT = 753

export type Cover = {
  src: string
  alt: string
  x: number
  y: number
  w: number
  h: number
  rotation: number
}

export const covers: Cover[] = [
  { src: "/covers/cover-3.png", alt: "New York Post — This is a dictator", x: 150, y: 140, w: 385, h: 432, rotation: -8 },
  { src: "/covers/cover-1.jpg", alt: "Daily News — Russia launches Ukraine attack", x: 110, y: 640, w: 293, h: 390, rotation: 22 },
  { src: "/covers/cover-4.png", alt: "How much more?", x: 1300, y: 130, w: 323, h: 309, rotation: 9 },
  { src: "/covers/cover-2.png", alt: "Battle to save Kyiv", x: 330, y: 770, w: 223, h: 286, rotation: -6 },
  { src: "/covers/cover-5.png", alt: "Daily Mail — Kyiv, the city of courage", x: 1345, y: 580, w: 333, h: 426, rotation: -18 },
  { src: "/covers/cover-6.jpg", alt: "Daily Mail — Putin to seize capital in days", x: 1195, y: 610, w: 342, h: 447, rotation: 12 },
  { src: "/covers/cover-7.jpg", alt: "The New York Times — War in Ukraine", x: 620, y: 785, w: 490, h: 166, rotation: 2 },
  { src: "/covers/cover-8.jpg", alt: "The Guardian — Putin invades", x: 215, y: 335, w: 392, h: 162, rotation: -5 },
  { src: "/covers/cover-9.jpg", alt: "The Sunday Times — Putin wipes out entire city", x: 140, y: 470, w: 444, h: 316, rotation: 6 },
]
