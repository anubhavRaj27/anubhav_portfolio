import { useCallback, useEffect, useRef } from 'react'
import * as THREE from 'three'

const SKIN = 0xd8a17a
const HAIR = 0x2e1f17
const SHIRT = 0xf2a6c1
const PANTS = 0x33405a
const FRAME = 0x141414
const SHOE = 0x2b2b2b

// The character is modelled around a 2.6 unit height with its feet on y = 0,
// so the camera framing below stays valid if individual limbs get retuned.
const START_X = 2.6
const HOME_X = 0
const WALK_SPEED = 1.35
const WALK_FREQ = 7.6
const TURN_DURATION = 0.45
const WAVE_DURATION = 2.4
const ENTRY_DELAY = 0.7

// Arms hang straight down, so a rotation about z swings them in the screen
// plane. Positive z lifts the +x arm outward and negative z lifts the -x arm,
// hence the side multiplier on every resting splay below.
const ARM_SPLAY = 0.09

const standardMaterial = (color, extra) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.02, ...extra })

function createShadow() {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128

  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(28, 26, 22, 0.4)')
  gradient.addColorStop(0.5, 'rgba(28, 26, 22, 0.15)')
  gradient.addColorStop(1, 'rgba(28, 26, 22, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 1.4),
    new THREE.MeshBasicMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      depthWrite: false,
    }),
  )
  mesh.rotation.x = -Math.PI * 0.5
  mesh.position.y = 0.005
  return mesh
}

function createAvatar() {
  const root = new THREE.Group()
  const body = new THREE.Group()
  root.add(body)
  root.add(createShadow())

  const skinMat = standardMaterial(SKIN)
  const hairMat = standardMaterial(HAIR, { roughness: 0.85 })
  const shirtMat = standardMaterial(SHIRT, { roughness: 0.88 })
  const pantsMat = standardMaterial(PANTS, { roughness: 0.9 })
  const frameMat = standardMaterial(FRAME, { roughness: 0.35, metalness: 0.15 })
  const shoeMat = standardMaterial(SHOE, { roughness: 0.7 })

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.5, 6, 20), shirtMat)
  torso.position.y = 1.35
  torso.scale.set(1, 1, 0.82)
  body.add(torso)

  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.05, 8, 20), shirtMat)
  collar.position.y = 1.83
  collar.rotation.x = Math.PI * 0.5
  collar.scale.set(1, 0.85, 1)
  body.add(collar)

  const makeLeg = (side) => {
    const hip = new THREE.Group()
    hip.position.set(0.15 * side, 0.86, 0)

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.125, 0.3, 4, 14), pantsMat)
    thigh.position.y = -0.24
    hip.add(thigh)

    const knee = new THREE.Group()
    knee.position.y = -0.46
    hip.add(knee)

    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.26, 4, 14), pantsMat)
    shin.position.y = -0.2
    knee.add(shin)

    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.11, 0.3), shoeMat)
    shoe.position.set(0, -0.34, 0.05)
    knee.add(shoe)

    body.add(hip)
    return { hip, knee }
  }

  const makeArm = (side) => {
    const shoulder = new THREE.Group()
    shoulder.position.set(0.29 * side, 1.66, 0)
    shoulder.rotation.z = ARM_SPLAY * side

    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.26, 4, 14), shirtMat)
    upper.position.y = -0.23
    shoulder.add(upper)

    const elbow = new THREE.Group()
    elbow.position.y = -0.44
    shoulder.add(elbow)

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.24, 4, 14), skinMat)
    forearm.position.y = -0.2
    elbow.add(forearm)

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 14), skinMat)
    hand.position.y = -0.38
    hand.scale.set(1, 1.1, 0.7)
    elbow.add(hand)

    body.add(shoulder)
    return { shoulder, elbow, side }
  }

  const head = new THREE.Group()
  head.position.y = 1.9
  body.add(head)

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.18, 16), skinMat)
  neck.position.y = -0.04
  head.add(neck)

  // Skull, hair and beard are concentric unscaled spheres. Squashing them
  // individually would let the hair sink into the skull once it is tilted, which
  // shows up as bare patches.
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.34, 32, 28), skinMat)
  skull.position.y = 0.3
  head.add(skull)

  // A hemisphere tipped backwards, so the front hairline lands just above the
  // brows while the sides and nape stay covered.
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.348, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5),
    hairMat,
  )
  hairCap.position.y = 0.3
  hairCap.rotation.x = -0.45
  head.add(hairCap)

  const quiff = new THREE.Mesh(new THREE.SphereGeometry(0.27, 20, 16), hairMat)
  quiff.position.set(0, 0.56, 0.08)
  quiff.scale.set(0.92, 0.52, 0.85)
  head.add(quiff)

  // A band covering jaw and chin only, low enough to leave the mouth clear.
  const beard = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 32, 28, 0, Math.PI * 2, Math.PI * 0.68, Math.PI * 0.32),
    hairMat,
  )
  beard.position.y = 0.3
  head.add(beard)

  const mustache = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 12), hairMat)
  mustache.position.set(0, 0.205, 0.295)
  mustache.scale.set(1.7, 0.55, 0.6)
  head.add(mustache)

  const eyeMat = standardMaterial(0x241a14, { roughness: 0.25 })
  const browGeo = new THREE.BoxGeometry(0.115, 0.028, 0.035)
  const eyeGeo = new THREE.SphereGeometry(0.048, 14, 12)

  const glassesGeo = new THREE.TorusGeometry(0.115, 0.021, 10, 24)
  const lensMat = standardMaterial(0xffffff, {
    roughness: 0.08,
    transparent: true,
    opacity: 0.16,
  })
  const lensGeo = new THREE.CircleGeometry(0.11, 24)
  const templeGeo = new THREE.BoxGeometry(0.016, 0.018, 0.24)

  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat)
    eye.position.set(0.135 * side, 0.34, 0.3)
    head.add(eye)

    const brow = new THREE.Mesh(browGeo, hairMat)
    brow.position.set(0.135 * side, 0.435, 0.275)
    brow.rotation.z = -0.12 * side
    head.add(brow)

    const rim = new THREE.Mesh(glassesGeo, frameMat)
    rim.position.set(0.135 * side, 0.34, 0.305)
    head.add(rim)

    const lens = new THREE.Mesh(lensGeo, lensMat)
    lens.position.set(0.135 * side, 0.34, 0.303)
    head.add(lens)

    const temple = new THREE.Mesh(templeGeo, frameMat)
    temple.position.set(0.245 * side, 0.345, 0.19)
    temple.rotation.y = 0.3 * side
    head.add(temple)

    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 12), skinMat)
    ear.position.set(0.325 * side, 0.3, 0)
    ear.scale.set(0.45, 1, 0.75)
    head.add(ear)
  }

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.018, 0.018), frameMat)
  bridge.position.set(0, 0.355, 0.31)
  head.add(bridge)

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 12), skinMat)
  nose.position.set(0, 0.25, 0.3)
  nose.scale.set(0.8, 1, 0.95)
  head.add(nose)

  const smile = new THREE.Mesh(
    new THREE.TorusGeometry(0.062, 0.014, 8, 20, Math.PI),
    standardMaterial(0x9c5049, { roughness: 0.5 }),
  )
  smile.position.set(0, 0.165, 0.295)
  smile.rotation.z = Math.PI
  head.add(smile)

  // Cartoon proportions, but the full size head read as too heavy for the body.
  head.scale.setScalar(0.9)

  return {
    root,
    body,
    head,
    legs: [makeLeg(-1), makeLeg(1)],
    arms: [makeArm(-1), makeArm(1)],
  }
}

export default function useHeroAvatar(mountRef, { active = true, reduced = false } = {}) {
  const activeRef = useRef(active)
  const waveRef = useRef(false)
  activeRef.current = active

  const triggerWave = useCallback(() => {
    waveRef.current = true
  }, [])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const width = mount.clientWidth || 240
    const height = mount.clientHeight || 300

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(28, width / height, 0.1, 50)
    camera.position.set(0, 1.55, 7.4)
    camera.lookAt(0, 1.35, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)
    renderer.setClearAlpha(0)
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xffffff, 0xe3ddcc, 2.1))

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.7)
    keyLight.position.set(2.5, 4.5, 3.5)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0xffd9e6, 0.6)
    rimLight.position.set(-3, 2, -2)
    scene.add(rimLight)

    const avatar = createAvatar()
    const { root, body, head, legs, arms } = avatar
    // The +x arm reads as screen-right once the character faces the camera.
    const wavingArm = arms.find((arm) => arm.side === 1)
    scene.add(root)

    let state = reduced ? 'idle' : 'pending'
    let elapsed = 0
    let pendingTime = 0
    let walkPhase = 0
    let turnTime = 0
    let waveTime = 0

    root.position.x = reduced ? HOME_X : START_X
    root.rotation.y = reduced ? 0 : -Math.PI * 0.5

    const applyRest = (amount = 1) => {
      for (const leg of legs) {
        leg.hip.rotation.x = 0
        leg.knee.rotation.x = 0
      }
      for (const arm of arms) {
        arm.shoulder.rotation.set(0, 0, ARM_SPLAY * arm.side)
        arm.elbow.rotation.set(0, 0, 0)
      }
      head.rotation.set(0, 0, 0)
      body.position.y = 0
      return amount
    }

    const applyWalk = (amplitude) => {
      const swing = Math.sin(walkPhase) * amplitude
      const lift = Math.abs(Math.cos(walkPhase)) * amplitude

      legs.forEach((leg, index) => {
        const dir = index === 0 ? 1 : -1
        leg.hip.rotation.x = swing * dir * 0.72
        // Knees only bend one way, so clamp the back half of the swing.
        leg.knee.rotation.x = Math.max(0, -swing * dir) * 0.75
      })

      arms.forEach((arm, index) => {
        const dir = index === 0 ? -1 : 1
        arm.shoulder.rotation.x = swing * dir * 0.55
        arm.shoulder.rotation.z = ARM_SPLAY * arm.side
        arm.elbow.rotation.x = -Math.abs(swing) * 0.35 * amplitude
      })

      body.position.y = lift * 0.055
      head.rotation.x = -0.05 * amplitude
    }

    const applyIdle = () => {
      const breath = Math.sin(elapsed * 1.7)
      body.position.y = breath * 0.018
      root.rotation.y = Math.sin(elapsed * 0.45) * 0.07
      head.rotation.y = Math.sin(elapsed * 0.31) * 0.16
      head.rotation.x = Math.sin(elapsed * 0.62) * 0.04

      for (const arm of arms) {
        arm.shoulder.rotation.x = breath * 0.045
        arm.shoulder.rotation.z = ARM_SPLAY * arm.side + breath * 0.02 * arm.side
        arm.elbow.rotation.x = -0.12
      }
    }

    const applyWave = (progress) => {
      // Ramp the arm up over the first fifth, hold, then drop over the last.
      const raise = Math.max(0, Math.min(1, progress / 0.2, (1 - progress) / 0.2))
      const shoulder = wavingArm.shoulder
      shoulder.rotation.z = ARM_SPLAY + raise * 2.05
      shoulder.rotation.x = raise * -0.12
      wavingArm.elbow.rotation.z = raise * (0.3 + Math.sin(elapsed * 11) * 0.45)
      wavingArm.elbow.rotation.x = 0
      head.rotation.z = raise * 0.07
      head.rotation.y += raise * -0.1
    }

    const clock = new THREE.Clock()

    // Advancing the rig is kept separate from the render loop so the pose for a
    // given elapsed time is reproducible.
    const step = (dt) => {
      elapsed += dt

      if (state === 'pending') {
        applyRest()
        if (activeRef.current) {
          pendingTime += dt
          if (pendingTime >= ENTRY_DELAY) state = 'walk'
        }
      } else if (state === 'walk') {
        root.position.x -= WALK_SPEED * dt
        walkPhase += WALK_FREQ * dt
        applyRest()
        applyWalk(1)
        if (root.position.x <= HOME_X) {
          root.position.x = HOME_X
          state = 'turn'
          turnTime = 0
        }
      } else if (state === 'turn') {
        turnTime += dt
        const k = Math.min(turnTime / TURN_DURATION, 1)
        const eased = k * k * (3 - 2 * k)
        root.rotation.y = -Math.PI * 0.5 * (1 - eased)
        applyRest()
        applyWalk(1 - eased)
        if (k >= 1) {
          state = 'wave'
          waveTime = 0
        }
      } else {
        applyRest()
        applyIdle()

        if (state === 'idle' && waveRef.current) {
          state = 'wave'
          waveTime = 0
        }

        if (state === 'wave') {
          waveTime += dt
          applyWave(Math.min(waveTime / WAVE_DURATION, 1))
          if (waveTime >= WAVE_DURATION) {
            state = 'idle'
            waveRef.current = false
          }
        } else {
          waveRef.current = false
        }
      }
    }

    renderer.setAnimationLoop(() => {
      step(Math.min(clock.getDelta(), 0.05))
      renderer.render(scene, camera)
    })

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = mount.clientWidth || width
      const nextHeight = mount.clientHeight || height
      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
      renderer.setSize(nextWidth, nextHeight)
    })
    resizeObserver.observe(mount)

    return () => {
      resizeObserver.disconnect()
      renderer.setAnimationLoop(null)
      scene.traverse((object) => {
        if (!object.isMesh) return
        object.geometry?.dispose?.()
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        for (const material of materials) {
          material?.map?.dispose?.()
          material?.dispose?.()
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [mountRef, reduced])

  return triggerWave
}
