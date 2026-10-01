"use client"

import { useRef } from "react"
import Image from "next/image"

import { gsap, SplitText, useGSAP } from "@/lib/gsap"
import { covers, LAYOUTS, MOBILE_BREAKPOINT, type Layout } from "./covers"

// ─── Réglages de la physique ────────────────────────────────────────────────
// Tout le « ressenti » du papier se règle ici.
const WIND_STRENGTH = 0.11 // force du souffle de la souris
const WIND_RADIUS = 260 // portée du souffle autour du curseur (en px de maquette)
const WIND_SPIN = 0.018 // à quel point le souffle fait tourner les feuilles
const RETURN_SPRING = 0.012 // vitesse de retour à la place d'origine
const AIR_DRAG = 0.9 // freinage dans l'air (plus proche de 1 = plus flottant)
const FLUTTER_SPRING = 0.045 // nervosité du battement des bords soulevés
const FLUTTER_DAMPING = 0.72 // amortissement du battement
const MAX_TILT = 12 // inclinaison maxi d'un bord soulevé (degrés)
const HOVER_PEEL = 5 // inclinaison quand on survole une feuille (degrés)
const SLIDE_FRICTION = 0.92 // glissade d'une feuille lancée puis lâchée

type Sheet = {
  // place « au repos » (modifiée quand on déplace une feuille)
  hx: number
  hy: number
  hr: number
  // décalage dû au vent (revient toujours à 0)
  ox: number
  oy: number
  or: number
  vx: number
  vy: number
  vr: number
  // élévation (0 = posée, 1 = en l'air) et inclinaison 3D
  lift: number
  tiltX: number
  tiltY: number
  vTiltX: number
  vTiltY: number
  // glissade après un lancer
  sx: number
  sy: number
  sliding: boolean
  // intro : 0 = pas encore arrivée, 1 = posée sur le bureau
  intro: number
  // départ au scroll : 0 = sur le bureau, 1 = sortie de l'écran
  leave: number
  leaveDelay: number
  // décalage vers les bords de l'écran quand il est plus large/haut que la maquette
  edgeX: number
  edgeY: number
  fromX: number
  fromY: number
  fromR: number
  w: number
  h: number
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v))

export function PaperDesk({ children }: { children?: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  useGSAP(
    (context) => {
      const scroller = scrollRef.current
      const root = rootRef.current
      const stage = stageRef.current
      if (!scroller || !root || !stage) return

      const groups = gsap.utils.toArray<HTMLElement>("[data-sheet]", stage)
      const papers = groups.map((g) =>
        g.querySelector<HTMLElement>("[data-paper]")!
      )
      const shadows = groups.map((g) =>
        g.querySelector<HTMLElement>("[data-shadow]")!
      )
      const shines = groups.map((g) =>
        g.querySelector<HTMLElement>("[data-shine]")!
      )

      const sheets: Sheet[] = covers.map((c) => ({
        hx: c.x,
        hy: c.y,
        hr: c.rotation,
        ox: 0,
        oy: 0,
        or: 0,
        vx: 0,
        vy: 0,
        vr: 0,
        lift: 0,
        tiltX: 0,
        tiltY: 0,
        vTiltX: 0,
        vTiltY: 0,
        sx: 0,
        sy: 0,
        sliding: false,
        intro: 0,
        leave: 0,
        leaveDelay: Math.random() * 0.35,
        edgeX: 0,
        edgeY: 0,
        fromX: 0,
        fromY: 0,
        fromR: gsap.utils.random(-35, 35),
        w: c.w,
        h: c.h,
      }))

      // ─── Mise en page : ordinateur ou mobile ───────────────────────────────
      let layout: Layout = "desktop"
      let frame = LAYOUTS.desktop
      const basePlacement = (i: number) =>
        layout === "mobile" ? covers[i].mobile : covers[i]

      // Replace toutes les feuilles selon la mise en page choisie
      const applyLayout = (next: Layout) => {
        layout = next
        frame = LAYOUTS[next]
        stage.dataset.layout = next
        stage.style.width = `${frame.width}px`
        stage.style.height = `${frame.height}px`
        sheets.forEach((s, i) => {
          const place = basePlacement(i)
          s.hx = place.x
          s.hy = place.y
          s.hr = place.rotation
          s.ox = s.oy = s.or = s.vx = s.vy = s.vr = 0
          s.sliding = false
          s.edgeX = s.edgeY = 0
          s.w = covers[i].w * frame.sheetScale
          s.h = covers[i].h * frame.sheetScale
          papers[i].style.width = shadows[i].style.width = `${s.w}px`
          papers[i].style.height = shadows[i].style.height = `${s.h}px`
          // chaque feuille arrive de l'extérieur, dans la direction de son bord
          const dx = place.x - frame.width / 2
          const dy = place.y - frame.height / 2
          const len = Math.hypot(dx, dy) || 1
          const distance = frame.width * (0.45 + Math.random() * 0.17)
          s.fromX = (dx / len) * distance
          s.fromY = (dy / len) * distance
        })
      }

      // Ordre d'empilement : index des feuilles du dessous vers le dessus
      const order = sheets.map((_, i) => i)
      const applyOrder = () =>
        order.forEach((idx, z) => (groups[idx].style.zIndex = String(z + 1)))
      applyOrder()

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches

      // ─── Scroll : les feuilles quittent le bureau vers l'extérieur ─────────
      // En remontant, elles reviennent à leur place.
      const scroll = { progress: 0 }
      const leaveEase = gsap.parseEase("power2.in")
      gsap.to(scroll, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: scroller,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      })

      // ─── Mise à l'échelle : la maquette remplit tout l'écran ───────────────
      let scale = 1
      let offsetX = 0
      let offsetY = 0
      // Le contenu est toujours visible en entier (centré). S'il reste de la place
      // sur les côtés ou en haut/bas, les feuilles s'écartent pour rester collées aux bords.
      let marginX = 0
      let marginY = 0
      const fit = () => {
        const { width, height } = root.getBoundingClientRect()
        const next: Layout = width < MOBILE_BREAKPOINT ? "mobile" : "desktop"
        if (next !== layout || !stage.dataset.layout) applyLayout(next)
        scale = Math.min(width / frame.width, height / frame.height)
        offsetX = (width - frame.width * scale) / 2
        offsetY = (height - frame.height * scale) / 2
        stage.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`

        marginX = offsetX / scale
        marginY = offsetY / scale
        sheets.forEach((s, i) => {
          const c = basePlacement(i)
          const edgeX = marginX * clamp((c.x - frame.width / 2) / (frame.width / 4), -1, 1)
          const edgeY = marginY * clamp((c.y - frame.height / 2) / (frame.height / 4), -1, 1)
          s.hx += edgeX - s.edgeX
          s.hy += edgeY - s.edgeY
          s.edgeX = edgeX
          s.edgeY = edgeY
        })
      }
      fit()
      const resizeObserver = new ResizeObserver(fit)
      resizeObserver.observe(root)

      // ─── Souris ────────────────────────────────────────────────────────────
      const mouse = {
        x: -9999,
        y: -9999,
        dx: 0,
        dy: 0,
        vx: 0,
        vy: 0,
        inside: false,
      }
      let hovered = -1
      let dragged = -1
      const grab = { x: 0, y: 0 }

      const toStage = (e: PointerEvent) => {
        const rect = root.getBoundingClientRect()
        return {
          x: (e.clientX - rect.left - offsetX) / scale,
          y: (e.clientY - rect.top - offsetY) / scale,
        }
      }

      const onMove = (e: PointerEvent) => {
        const p = toStage(e)
        if (mouse.inside) {
          mouse.dx += p.x - mouse.x
          mouse.dy += p.y - mouse.y
        }
        mouse.x = p.x
        mouse.y = p.y
        mouse.inside = true
      }
      const onLeave = () => {
        mouse.inside = false
        hovered = -1
      }

      const sheetIndex = (e: PointerEvent) => {
        const el = (e.target as HTMLElement).closest<HTMLElement>(
          "[data-sheet]"
        )
        return el ? Number(el.dataset.sheet) : -1
      }

      const onOver = (e: PointerEvent) => (hovered = sheetIndex(e))

      const onDown = (e: PointerEvent) => {
        const i = sheetIndex(e)
        if (i < 0 || sheets[i].intro < 0.95 || sheets[i].leave > 0.02) return
        e.preventDefault()
        const s = sheets[i]
        // Le décalage du vent devient la nouvelle place : la feuille ne « saute » pas
        s.hx += s.ox
        s.hy += s.oy
        s.ox = s.oy = s.vx = s.vy = 0
        s.sliding = false
        const p = toStage(e)
        grab.x = p.x - s.hx
        grab.y = p.y - s.hy
        dragged = i
        // On passe la feuille au-dessus de la pile
        order.splice(order.indexOf(i), 1)
        order.push(i)
        applyOrder()
        root.setPointerCapture(e.pointerId)
        root.dataset.dragging = "true"
      }

      const onUp = (e: PointerEvent) => {
        if (dragged < 0) return
        sheets[dragged].sliding = true
        dragged = -1
        if (root.hasPointerCapture(e.pointerId))
          root.releasePointerCapture(e.pointerId)
        delete root.dataset.dragging
      }

      root.addEventListener("pointermove", onMove)
      root.addEventListener("pointerleave", onLeave)
      root.addEventListener("pointerover", onOver)
      root.addEventListener("pointerdown", onDown)
      root.addEventListener("pointerup", onUp)
      root.addEventListener("pointercancel", onUp)

      // ─── Boucle d'animation (60 fois par seconde) ──────────────────────────
      const tick = () => {
        const dt = Math.min(gsap.ticker.deltaRatio(60), 3)

        // Vitesse de la souris lissée = force et direction du « vent »
        mouse.vx = mouse.vx * 0.8 + (mouse.dx / dt) * 0.2
        mouse.vy = mouse.vy * 0.8 + (mouse.dy / dt) * 0.2
        mouse.dx = mouse.dy = 0
        const speed = Math.hypot(mouse.vx, mouse.vy)

        sheets.forEach((s, i) => {
          // chaque feuille part avec un léger décalage, pour un départ désordonné
          s.leave = leaveEase(
            clamp((scroll.progress - s.leaveDelay) / 0.65, 0, 1)
          )
          const layer = order.indexOf(i) / (order.length - 1) // 0 = dessous, 1 = dessus
          let liftTarget = 0
          let tiltXTarget = 0
          let tiltYTarget = 0
          const rotation = s.hr + s.or
          const rad = (rotation * Math.PI) / 180
          const cos = Math.cos(rad)
          const sin = Math.sin(rad)

          if (i === dragged) {
            // ── Feuille tenue en main ──
            const nx = mouse.x - grab.x
            const ny = mouse.y - grab.y
            s.sx = (nx - s.hx) / dt
            s.sy = (ny - s.hy) / dt
            s.hx = nx
            s.hy = ny
            // Tirée par un coin, la feuille pivote comme une vraie feuille
            s.vr += (grab.x * s.sy - grab.y * s.sx) * 0.00015 * dt
            liftTarget = 1
            const lx = s.sx * cos + s.sy * sin
            const ly = -s.sx * sin + s.sy * cos
            tiltYTarget = clamp(lx * 0.3, -6, 6)
            tiltXTarget = clamp(-ly * 0.3, -6, 6)
          } else {
            // ── Glissade après un lancer ──
            if (s.sliding) {
              s.hx += s.sx * dt
              s.hy += s.sy * dt
              s.sx *= Math.pow(SLIDE_FRICTION, dt)
              s.sy *= Math.pow(SLIDE_FRICTION, dt)
              s.hx = clamp(s.hx, -marginX, frame.width + marginX)
              s.hy = clamp(s.hy, -marginY, frame.height + marginY)
              if (Math.hypot(s.sx, s.sy) < 0.05) s.sliding = false
            }

            // ── Souffle de la souris ──
            const cx = s.hx + s.ox
            const cy = s.hy + s.oy
            const dx = cx - mouse.x
            const dy = cy - mouse.y
            const dist = Math.hypot(dx, dy) || 1
            const radius = WIND_RADIUS + Math.max(s.w, s.h) * 0.35
            let falloff = clamp(1 - dist / radius, 0, 1)
            falloff *= falloff
            // Les feuilles du dessus prennent plus le vent que celles du dessous
            const exposure =
              reducedMotion || !mouse.inside
                ? 0
                : falloff * (0.35 + 0.65 * layer) * s.intro * (1 - s.leave)

            if (exposure > 0 && speed > 0.2) {
              const gust = clamp(speed, 0, 60)
              const dirX = mouse.vx / speed
              const dirY = mouse.vy / speed
              // poussée dans le sens du mouvement + un peu vers l'extérieur
              s.vx +=
                (dirX * gust * WIND_STRENGTH + (dx / dist) * gust * 0.03) *
                exposure *
                dt
              s.vy +=
                (dirY * gust * WIND_STRENGTH + (dy / dist) * gust * 0.03) *
                exposure *
                dt
              // rotation : le vent qui passe à côté d'une feuille la fait pivoter
              s.vr +=
                ((dx * mouse.vy - dy * mouse.vx) / radius) *
                WIND_SPIN *
                exposure *
                dt

              // le bord face au vent se soulève
              const lx = dirX * cos + dirY * sin
              const ly = -dirX * sin + dirY * cos
              const strength = clamp(gust * exposure * 0.09, 0, 1)
              liftTarget = strength
              tiltYTarget = lx * strength * MAX_TILT
              tiltXTarget = -ly * strength * MAX_TILT
            }

            // ── Survol : on « décolle » doucement le coin sous le curseur ──
            if (
              i === hovered &&
              dragged < 0 &&
              !reducedMotion &&
              s.intro > 0.99
            ) {
              const mx = mouse.x - cx
              const my = mouse.y - cy
              const lx = (mx * cos + my * sin) / (s.w / 2)
              const ly = (-mx * sin + my * cos) / (s.h / 2)
              tiltYTarget += -clamp(lx, -1, 1) * HOVER_PEEL
              tiltXTarget += clamp(ly, -1, 1) * HOVER_PEEL
              liftTarget = Math.max(liftTarget, 0.18)
            }
          }

          // ── Ressorts : chaque feuille revient à sa place ──
          s.vx += -s.ox * RETURN_SPRING * dt
          s.vy += -s.oy * RETURN_SPRING * dt
          s.vr += -s.or * RETURN_SPRING * 1.4 * dt
          const drag = Math.pow(AIR_DRAG, dt)
          s.vx *= drag
          s.vy *= drag
          s.vr *= drag
          s.ox += s.vx * dt
          s.oy += s.vy * dt
          s.or += s.vr * dt

          // ── Battement des bords (léger dépassement = effet papier) ──
          s.vTiltX +=
            (clamp(tiltXTarget, -MAX_TILT, MAX_TILT) - s.tiltX) *
            FLUTTER_SPRING *
            dt
          s.vTiltY +=
            (clamp(tiltYTarget, -MAX_TILT, MAX_TILT) - s.tiltY) *
            FLUTTER_SPRING *
            dt
          const flutterDamp = Math.pow(FLUTTER_DAMPING, dt)
          s.vTiltX *= flutterDamp
          s.vTiltY *= flutterDamp
          s.tiltX += s.vTiltX * dt
          s.tiltY += s.vTiltY * dt
          s.lift +=
            (liftTarget - s.lift) * (liftTarget > s.lift ? 0.2 : 0.06) * dt

          // ── Rendu ──
          const away = 1 - s.intro // 1 = encore en vol pendant l'intro
          const fly = Math.max(away, s.leave * 1.4) // distance vers l'extérieur (intro ou scroll)
          const x = s.hx + s.ox - s.w / 2 + s.fromX * fly
          const y = s.hy + s.oy - s.h / 2 + s.fromY * fly
          const r = s.hr + s.or + s.fromR * fly
          const lift = clamp(Math.max(s.lift, fly), 0, 1)
          papers[i].style.transform =
            `translate3d(${x}px, ${y}px, ${lift * 40}px) rotate(${r}deg) ` +
            `rotateX(${s.tiltX}deg) rotateY(${s.tiltY}deg) scale(${1 + s.lift * 0.035 + away * 0.25})`
          papers[i].style.opacity = String(clamp(s.intro * 4, 0, 1))
          shadows[i].style.transform =
            `translate3d(${x + lift * 4}px, ${y + lift * 6}px, 0) rotate(${r}deg) scale(${1 + lift * 0.01})`
          shadows[i].style.opacity = String(
            lift * 0.12 * clamp(s.intro * 4, 0, 1)
          )
          const tiltAmount = Math.hypot(s.tiltX, s.tiltY)
          shines[i].style.opacity = String(clamp(tiltAmount / 18, 0, 0.9))
          shines[i].style.setProperty(
            "--shine-angle",
            `${Math.atan2(s.tiltX, -s.tiltY)}rad`
          )
        })
      }

      gsap.ticker.add(tick)

      // ─── Intro au chargement ───────────────────────────────────────────────
      // Le texte apparaît d'abord, puis les feuilles sont « lancées » sur le bureau.
      const intro = () => {
        // Seulement les éléments de la mise en page affichée (ordinateur ou mobile)
        const visible = (selector: string) =>
          gsap.utils
            .toArray<HTMLElement>(selector, stage)
            .filter((el) => el.offsetParent !== null)
        const title = visible("[data-reveal=title]")[0]
        const header = visible("[data-reveal=header]")
        const squares = visible("[data-reveal=product] [data-square]")
        const productLabels = visible("[data-reveal=product] > p")
        const content = stage.querySelector<HTMLElement>("[data-content]")

        if (reducedMotion) {
          gsap.set(content, { autoAlpha: 1 })
          gsap.to(sheets, { intro: 1, duration: 0.6, ease: "power1.out" })
          return
        }

        const tl = gsap.timeline({ defaults: { ease: "expo.out" } })
        tl.set(content, { autoAlpha: 1 })

        // En-tête : chaque mot glisse vers le haut
        tl.from(
          header,
          { yPercent: 120, autoAlpha: 0, duration: 1, stagger: 0.07 },
          0
        )

        // Titre : les lettres montent une à une depuis un masque
        if (title) {
          const split = SplitText.create(title, {
            type: "lines,chars",
            mask: "lines",
          })
          tl.from(
            split.chars,
            { yPercent: 110, rotate: 6, duration: 1.3, stagger: 0.022 },
            0.15
          )
        }

        // Produits : le carré se dévoile de bas en haut, puis les légendes
        tl.from(
          squares,
          {
            clipPath: "inset(100% 0% 0% 0%)",
            duration: 1.2,
            ease: "expo.inOut",
            stagger: 0.1,
          },
          0.5
        )
        tl.from(
          productLabels,
          { y: 8, autoAlpha: 0, duration: 0.8, stagger: 0.05 },
          1.2
        )

        // Feuilles : lancées depuis les bords, dans le désordre
        tl.to(
          sheets,
          {
            intro: 1,
            duration: 1.6,
            ease: "expo.out",
            stagger: { each: 0.08, from: "random" },
          },
          0.9
        )
      }

      // On attend la police pour découper le titre au bon endroit
      let alive = true
      document.fonts.ready.then(() => alive && context.add(intro))

      return () => {
        alive = false
        gsap.ticker.remove(tick)
        resizeObserver.disconnect()
        root.removeEventListener("pointermove", onMove)
        root.removeEventListener("pointerleave", onLeave)
        root.removeEventListener("pointerover", onOver)
        root.removeEventListener("pointerdown", onDown)
        root.removeEventListener("pointerup", onUp)
        root.removeEventListener("pointercancel", onUp)
      }
    },
    { scope: rootRef }
  )

  return (
    // La page est plus haute que l'écran pour pouvoir scroller ; le bureau reste collé en haut.
    <div ref={scrollRef} className="relative h-[200svh]">
      <div
        ref={rootRef}
        className="group/desk sticky top-0 h-svh w-full overflow-hidden bg-desk select-none"
      >
        <div
          ref={stageRef}
          className="group/stage absolute top-0 left-0 origin-top-left"
          style={{ width: LAYOUTS.desktop.width, height: LAYOUTS.desktop.height, perspective: 2600 }}
        >
          {/* Contenu de la page, caché sous les feuilles (invisible jusqu'à l'intro) */}
          <div data-content className="invisible absolute inset-0">
            {children}
          </div>

          {covers.map((cover, i) => (
            <div
              key={cover.src}
              data-sheet={i}
              className="pointer-events-none absolute inset-0"
            >
              {/* Ombre portée sur le bureau */}
              <div
                data-shadow
                aria-hidden
                className="absolute top-0 left-0 bg-black blur-[2px] will-change-transform"
                style={{ width: cover.w, height: cover.h, opacity: 0 }}
              />
              {/* La feuille */}
              <div
                data-paper
                className="pointer-events-auto absolute top-0 left-0 touch-pan-y overflow-hidden bg-white will-change-transform"
                style={{
                  width: cover.w,
                  height: cover.h,
                  transform: `translate3d(${cover.x - cover.w / 2}px, ${cover.y - cover.h / 2}px, 0) rotate(${cover.rotation}deg)`,
                  opacity: 0,
                }}
              >
                <Image
                  src={cover.src}
                  alt={cover.alt}
                  fill
                  draggable={false}
                  loading="eager"
                  sizes={`${Math.round(cover.w * 1.5)}px`}
                  className="object-cover object-top"
                />
                {/* Reflet de lumière quand un bord se soulève */}
                <div
                  data-shine
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0"
                  style={{
                    background:
                      "linear-gradient(var(--shine-angle, 0rad), rgb(255 255 255 / 0.45), transparent 45%, rgb(0 0 0 / 0.28))",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
