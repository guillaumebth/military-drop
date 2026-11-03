import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js"

import { CLOSED_CURVE, CLOSED_WAVE } from "./closed-curve"

// ─── Réglages ───────────────────────────────────────────────────────────────
// Tout le « ressenti » du brassard se règle ici.
const ASSETS = "/models/brassard"
const PEEL_WIDTH = 0.6 // longueur de bande qui se déroule en même temps (0 à 1)
const TILT_CLOSED = 0.36 // vue plongeante quand il est fermé (radians)
const SWING = -0.75 // rotation pendant l'ouverture, pour voir le scratch se défaire (radians)
const OVERLAP_LIFT = 0.0055 // l'extrémité scratchée passe par-dessus l'autre (mètres)
// Mouvement au repos : petit balancement et flottement, très lents
const IDLE_ROTATION = 0.14 // amplitude de la rotation (radians)
const IDLE_ROTATION_SPEED = 0.55 // vitesse de la rotation
const IDLE_FLOAT = 7 // amplitude du haut / bas (pixels de maquette)
const IDLE_FLOAT_SPEED = 0.8 // vitesse du haut / bas
const IDLE_WHEN_OPEN = 0.35 // part du mouvement conservée une fois le brassard à plat
// Taille du brassard à l'écran, en pixels de maquette par mètre, et position de son centre
const LAYOUTS = {
  desktop: { closed: 2150, open: 2150, x: 720, y: 430 },
  mobile: { closed: 1500, open: 840, x: 195, y: 410 },
}

export type BrassardLayout = keyof typeof LAYOUTS

// ─── Géométrie de la bande ──────────────────────────────────────────────────
const LENGTH = 0.42 // longueur de la bande à plat (mètres)
const SAMPLES = 96 // points de la courbe envoyés à la carte graphique
const STEPS = 480 // finesse du calcul de la courbe

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// Angle du modèle fermé à une position s (0 = bout scratché, 1 = autre bout)
const closedAngle = (s: number) => {
  const i = s * (CLOSED_CURVE.length - 1)
  const a = Math.min(CLOSED_CURVE.length - 2, Math.floor(i))
  return CLOSED_CURVE[a] + (CLOSED_CURVE[a + 1] - CLOSED_CURVE[a]) * (i - a)
}

// Ondulation du tissu à plat à une position s
const waveAt = (s: number) => CLOSED_WAVE[Math.min(CLOSED_WAVE.length - 1, Math.floor(s * CLOSED_WAVE.length))]

// Le texte reste face à la caméra : on oriente la bande depuis ce point
const FACING = 0.435

// Calcule la forme de la bande pour une ouverture de 0 (fermé) à 1 (à plat).
// Le déroulé part du bout scratché et traverse la bande, comme quand on l'ouvre à la main.
function writeCurve(open: number, out: Float32Array) {
  const front = open * (1 + PEEL_WIDTH) - PEEL_WIDTH
  const ds = 1 / STEPS
  const angles = new Float32Array(STEPS + 1)
  for (let i = 1; i <= STEPS; i++) {
    const s = i * ds
    const curl = closedAngle(s) - closedAngle(s - ds)
    angles[i] = angles[i - 1] + curl * smoothstep(front, front + PEEL_WIDTH, s - ds / 2)
  }
  const facing = angles[Math.round(FACING * STEPS)]

  // On suit la bande pas à pas pour obtenir sa position
  const xs = new Float32Array(STEPS + 1)
  const zs = new Float32Array(STEPS + 1)
  for (let i = 1; i <= STEPS; i++) {
    const a = (angles[i - 1] + angles[i]) / 2 - facing
    xs[i] = xs[i - 1] + Math.cos(a) * LENGTH * ds
    zs[i] = zs[i - 1] - Math.sin(a) * LENGTH * ds
  }
  // Centre de la forme visible (et non moyenne des points, faussée par le recouvrement)
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cz = (Math.min(...zs) + Math.max(...zs)) / 2

  // Le centre reste fixe à l'écran. Fermé, le tissu est tendu (sans ondulation) et le bout
  // scratché passe par-dessus l'autre ; les deux s'effacent dès que le scratch se défait.
  const closed = 1 - smoothstep(0, 0.25, open)
  for (let n = 0; n < SAMPLES; n++) {
    const s = n / (SAMPLES - 1)
    const i = Math.round(s * STEPS)
    const a = angles[i] - facing
    const tx = Math.cos(a)
    const tz = -Math.sin(a)
    const raise = closed * (OVERLAP_LIFT * (1 - smoothstep(0.13, 0.4, s)) - waveAt(s))
    out[n * 4] = xs[i] - cx - tz * raise
    out[n * 4 + 1] = zs[i] - cz + tx * raise
    out[n * 4 + 2] = tx
    out[n * 4 + 3] = tz
  }
}

// Chaque point du modèle à plat suit la courbe calculée ci-dessus
const curveUniform = { value: new Float32Array(SAMPLES * 4) }

function followCurve(material: THREE.Material) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uCurve = curveUniform
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform vec4 uCurve[${SAMPLES}];
        vec4 curveAt(float x) {
          float i = clamp(x / ${LENGTH.toFixed(3)} + 0.5, 0.0, 1.0) * ${(SAMPLES - 1).toFixed(1)};
          int a = int(min(floor(i), ${(SAMPLES - 2).toFixed(1)}));
          return mix(uCurve[a], uCurve[a + 1], i - float(a));
        }`
      )
      .replace(
        "#include <beginnormal_vertex>",
        `#include <beginnormal_vertex>
        vec4 bandPoint = curveAt(position.x);
        vec3 bandTangent = normalize(vec3(bandPoint.z, 0.0, bandPoint.w));
        vec3 bandOutside = vec3(-bandTangent.z, 0.0, bandTangent.x);
        objectNormal = objectNormal.x * bandTangent + vec3(0.0, objectNormal.y, 0.0) + objectNormal.z * bandOutside;`
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        transformed = vec3(bandPoint.x, position.y, bandPoint.y) + position.z * bandOutside;`
      )
  }
  // Toutes les pièces partagent le même programme déformé
  material.customProgramCacheKey = () => "brassard-curve"
}

// ─── Scène ──────────────────────────────────────────────────────────────────
export async function createBrassard(canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = environment
  scene.environmentIntensity = 0.55
  pmrem.dispose()

  const key = new THREE.DirectionalLight(0xffffff, 1.5)
  key.position.set(-0.5, 0.45, 0.6)
  scene.add(key)

  // Caméra réglée pour que 1 mètre = 1000 pixels de maquette à hauteur du brassard
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 10)
  camera.position.z = 1.4

  const armband = new THREE.Group()
  scene.add(armband)

  // ─── Chargement ───────────────────────────────────────────────────────────
  const textureLoader = new THREE.TextureLoader()
  const loadTexture = async (name: string, colorSpace: THREE.ColorSpace) => {
    const texture = await textureLoader.loadAsync(`${ASSETS}/${name}.webp`)
    texture.flipY = false
    texture.colorSpace = colorSpace
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    return texture
  }
  const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
  const [gltf, print, inner, fabricNormal, velcroNormal, hooksNormal] = await Promise.all([
    gltfLoader.loadAsync(`${ASSETS}/brassard.glb`),
    loadTexture("print", THREE.SRGBColorSpace),
    loadTexture("inner", THREE.SRGBColorSpace),
    loadTexture("fabric-normal", THREE.NoColorSpace),
    loadTexture("velcro-normal", THREE.NoColorSpace),
    loadTexture("hooks-normal", THREE.NoColorSpace),
  ])

  const fabric = (map: THREE.Texture) =>
    new THREE.MeshPhysicalMaterial({
      map,
      normalMap: fabricNormal,
      normalScale: new THREE.Vector2(0.7, 0.7),
      roughness: 0.85,
      sheen: 0.25,
      sheenRoughness: 0.7,
      sheenColor: new THREE.Color(0xffffff),
      specularIntensity: 0.4,
    })
  const velcro = (normalMap: THREE.Texture, roughness: number) =>
    new THREE.MeshPhysicalMaterial({
      color: 0x0d0d0e,
      normalMap,
      roughness,
      sheen: 0.6,
      sheenColor: new THREE.Color(0x777777),
    })
  // Les fils gardent la couleur exportée depuis Blender
  const replacements: Record<string, THREE.Material> = {
    BR_Tissu_Imprime: fabric(print),
    BR_Tissu_Dos: fabric(inner),
    BR_Velcro: velcro(velcroNormal, 0.95),
    BR_Velcro_Crochets: velcro(hooksNormal, 0.45),
  }

  const materials = new Set<THREE.Material>()
  const geometries = new Set<THREE.BufferGeometry>()
  gltf.scene.traverse((node) => {
    if (!(node instanceof THREE.Mesh)) return
    const material: THREE.Material = replacements[node.material.name] ?? node.material
    followCurve(material)
    node.material = material
    node.frustumCulled = false // la forme change, la boîte englobante d'origine ne vaut plus
    materials.add(material)
    geometries.add(node.geometry)
  })
  armband.add(gltf.scene)

  // ─── État ─────────────────────────────────────────────────────────────────
  let open = 0
  let layout: BrassardLayout = "desktop"
  const frame = { width: 1440, height: 800 }

  const idle = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1
  let time = 0
  let dirty = true

  const render = () => {
    writeCurve(open, curveUniform.value)
    const eased = smoothstep(0, 1, open)
    const sway = idle * (1 - (1 - IDLE_WHEN_OPEN) * eased)
    armband.rotation.x = TILT_CLOSED * (1 - eased)
    armband.rotation.y = SWING * Math.sin(Math.PI * eased) + IDLE_ROTATION * sway * Math.sin(time * IDLE_ROTATION_SPEED)

    const place = LAYOUTS[layout]
    const float = IDLE_FLOAT * sway * Math.sin(time * IDLE_FLOAT_SPEED)
    armband.scale.setScalar((place.closed + (place.open - place.closed) * eased) / 1000)
    armband.position.set((place.x - frame.width / 2) / 1000, -(place.y + float - frame.height / 2) / 1000, 0)
    renderer.render(scene, camera)
    dirty = false
  }

  return {
    // Ouverture du brassard : 0 = fermé, 1 = à plat
    setOpen(value: number) {
      open = value
      dirty = true
    },
    // À appeler à chaque image, avec le temps écoulé en secondes
    tick(seconds: number) {
      time = seconds
      if (idle || dirty) render()
    },
    // width / height = taille de la maquette, ratio = pixels réels par pixel de maquette
    resize(width: number, height: number, ratio: number, nextLayout: BrassardLayout) {
      frame.width = width
      frame.height = height
      layout = nextLayout
      renderer.setPixelRatio(ratio)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.fov = (2 * Math.atan(height / 1000 / 2 / camera.position.z) * 180) / Math.PI
      camera.updateProjectionMatrix()
      render()
    },
    dispose() {
      materials.forEach((m) => m.dispose())
      geometries.forEach((g) => g.dispose())
      ;[print, inner, fabricNormal, velcroNormal, hooksNormal].forEach((t) => t.dispose())
      environment.dispose()
      renderer.dispose()
    },
  }
}
