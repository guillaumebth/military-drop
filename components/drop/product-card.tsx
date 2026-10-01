"use client"

import { useRef } from "react"

import { gsap, useGSAP } from "@/lib/gsap"

type ProductCardProps = {
  name: string
  price: string
  left: number
}

const label = "absolute top-[308px] font-display text-[10px] leading-none text-black uppercase whitespace-nowrap"

// Carte produit : au survol, l'étiquette « View product » apparaît d'un coup et suit la souris.
export function ProductCard({ name, price, left }: ProductCardProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const squareRef = useRef<HTMLButtonElement>(null)
  const tagRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      const square = squareRef.current
      const tag = tagRef.current
      if (!square || !tag) return

      // Style brutaliste : pas de fondu, pas de retard. L'étiquette colle au curseur
      // et saute de case en case sur une grille de 8 px.
      const GRID = 8
      const snap = gsap.utils.snap(GRID)
      gsap.set(tag, { xPercent: -50, yPercent: -50, x: 150, y: 150, autoAlpha: 0 })
      const place = (p: { x: number; y: number }) => gsap.set(tag, { x: snap(p.x), y: snap(p.y) })

      // Position de la souris dans la carte (la page est mise à l'échelle, on corrige)
      const local = (e: PointerEvent) => {
        const rect = square.getBoundingClientRect()
        const ratio = square.offsetWidth / rect.width
        return { x: (e.clientX - rect.left) * ratio, y: (e.clientY - rect.top) * ratio }
      }

      const onEnter = (e: PointerEvent) => {
        place(local(e))
        gsap.set(tag, { autoAlpha: 1 })
      }
      const onMove = (e: PointerEvent) => place(local(e))
      const onLeave = () => gsap.set(tag, { autoAlpha: 0 })

      square.addEventListener("pointerenter", onEnter)
      square.addEventListener("pointermove", onMove)
      square.addEventListener("pointerleave", onLeave)
      return () => {
        square.removeEventListener("pointerenter", onEnter)
        square.removeEventListener("pointermove", onMove)
        square.removeEventListener("pointerleave", onLeave)
      }
    },
    { scope: rootRef },
  )

  return (
    <div ref={rootRef} data-reveal="product" className="absolute top-[360px] w-[300px]" style={{ left }}>
      <button
        ref={squareRef}
        type="button"
        data-square
        aria-label={`View product: ${name}`}
        className="relative block size-[300px] cursor-pointer overflow-hidden bg-placeholder"
      >
        <span
          ref={tagRef}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 bg-black px-4 py-2 font-display text-[12px] leading-none whitespace-nowrap text-white uppercase opacity-0"
        >
          View product
        </span>
      </button>
      <p className={`${label} left-0`}>{name}</p>
      <p className={`${label} left-[115px]`}>{price}</p>
    </div>
  )
}
