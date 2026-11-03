"use client"

import { useRef } from "react"

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap"
import type { BrassardLayout } from "./scene"

// Le brassard en 3D : fermé en haut de page, il s'ouvre au fil du scroll.
export function Brassard() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useGSAP(() => {
    const canvas = canvasRef.current
    const scroller = canvas?.closest("[data-scroller]")
    const stage = canvas?.closest<HTMLElement>("[data-stage]")
    if (!canvas || !scroller || !stage) return

    let alive = true
    let cleanup = () => {}

    // Three.js et le modèle ne se chargent qu'une fois la page affichée
    import("./scene")
      .then(({ createBrassard }) => createBrassard(canvas))
      .then((brassard) => {
        if (!alive) return brassard.dispose()

        // Le canvas suit la mise à l'échelle de la maquette et reste net sur tous les écrans
        const fit = () => {
          const ratio = canvas.getBoundingClientRect().width / canvas.clientWidth
          const pixels = Math.min(ratio * window.devicePixelRatio, 2.5)
          brassard.resize(canvas.clientWidth, canvas.clientHeight, pixels, stage.dataset.layout as BrassardLayout)
        }
        fit()
        // Prévient la page : le drapeau de chargement peut s'ouvrir
        window.dispatchEvent(new Event("brassard:ready"))
        const onResize = () => requestAnimationFrame(fit)
        window.addEventListener("resize", onResize)

        const progress = { open: 0 }
        const trigger = ScrollTrigger.create({
          trigger: scroller,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
          animation: gsap.to(progress, {
            open: 1,
            ease: "none",
            onUpdate: () => brassard.setOpen(progress.open),
          }),
        })
        const tick = (time: number) => brassard.tick(time)
        gsap.ticker.add(tick)
        const appear = gsap.fromTo(canvas, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: "power1.out" })

        cleanup = () => {
          window.removeEventListener("resize", onResize)
          gsap.ticker.remove(tick)
          trigger.kill()
          appear.kill()
          brassard.dispose()
        }
      })
      .catch((error) => console.error("Brassard 3D indisponible", error))

    return () => {
      alive = false
      cleanup()
    }
  })

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none invisible absolute inset-0 size-full" />
}
