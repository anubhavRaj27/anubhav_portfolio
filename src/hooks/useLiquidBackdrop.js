import { useEffect } from 'react'
import * as THREE from 'three'

// One domain-warped fractal noise field drives both layers: the soft fill comes
// from the field value, the contour lines from the fractional part of that same
// value. Sampling it once keeps this cheap enough to run fullscreen alongside
// the hero scene and the avatar.
const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uPointer;
  uniform float uPointerStrength;
  uniform float uScale;
  uniform float uRings;
  uniform float uLineWidth;
  uniform float uBlobStrength;
  uniform float uLineStrength;
  uniform vec3 uBase;
  uniform vec3 uBlobColor;
  uniform vec3 uLineColor;

  // Cheap gradient hash. A sin-based hash costs four transcendentals per call,
  // which is far too much at fullscreen resolution.
  vec2 hash2(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p3 += dot(p3, p3.yzx + 33.33);
    return -1.0 + 2.0 * fract((p3.xx + p3.yz) * p3.zy);
  }

  float gnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(dot(hash2(i), f), dot(hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(
        dot(hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
        dot(hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)),
        u.x
      ),
      u.y
    );
  }

  const mat2 ROT = mat2(0.80, 0.60, -0.60, 0.80);

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;

    for (int i = 0; i < 3; i++) {
      v += a * gnoise(p);
      p = ROT * p * 2.03;
      a *= 0.5;
    }

    return v;
  }

  void main() {
    vec2 p = vUv - 0.5;
    p.x *= uAspect;

    // Drag the field toward the cursor so it reads as a viscous lens rather
    // than a flat texture.
    vec2 toPointer = p - uPointer;
    float falloff = exp(-dot(toPointer, toPointer) * 5.0);
    p -= toPointer * falloff * uPointerStrength;

    p *= uScale;

    vec2 q = vec2(
      fbm(p + vec2(0.0, uTime * 0.055)),
      fbm(p + vec2(4.3, 1.7) - vec2(uTime * 0.042, 0.0))
    );

    float field = fbm(p + 2.4 * q + vec2(uTime * 0.02, uTime * -0.015));

    float blob = smoothstep(0.01, 0.26, field);

    // Isolines: draw a band wherever the scaled field crosses an integer.
    // fwidth keeps the stroke a constant pixel width no matter the gradient.
    float rings = field * uRings;
    float edge = abs(fract(rings) - 0.5);
    float line = 1.0 - smoothstep(0.0, fwidth(rings) * uLineWidth, edge);

    vec3 color = uBase;
    color = mix(color, uBlobColor, blob * uBlobStrength);
    color = mix(color, uLineColor, line * uLineStrength);

    // Near-white gradients band badly on 8 bit displays.
    float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    color += (dither - 0.5) / 255.0;

    gl_FragColor = vec4(color, 1.0);
  }
`

export default function useLiquidBackdrop(mountRef, { reduced = false } = {}) {
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const width = mount.clientWidth || window.innerWidth
    const height = mount.clientHeight || window.innerHeight

    const uniforms = {
      uTime: { value: 0 },
      uAspect: { value: width / height },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: reduced ? 0 : 0.34 },
      uScale: { value: 1.55 },
      uRings: { value: 9.0 },
      uLineWidth: { value: 1.4 },
      uBlobStrength: { value: 1.0 },
      uLineStrength: { value: 0.9 },
      // Dark field. The blob sits only a few levels above the base so it reads
      // as depth rather than as a shape, and the contour lines carry a slight
      // warm cast to tie into the orange accent.
      uBase: { value: new THREE.Color(0x0a0a0a) },
      uBlobColor: { value: new THREE.Color(0x1a1714) },
      uLineColor: { value: new THREE.Color(0x453a30) },
    }

    const scene = new THREE.Scene()
    const camera = new THREE.Camera()
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms,
        depthWrite: false,
      }),
    )
    scene.add(mesh)

    const renderer = new THREE.WebGLRenderer({ antialias: false })
    // The field is deliberately soft, so a sub-native buffer is invisible here
    // and buys back most of the cost of running a fullscreen noise shader.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1))
    renderer.setSize(width, height)
    mount.appendChild(renderer.domElement)

    const pointerTarget = new THREE.Vector2(0, 0)
    let hasPointer = false

    const handlePointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      pointerTarget.set(
        ((event.clientX - rect.left) / rect.width - 0.5) * (rect.width / rect.height),
        -((event.clientY - rect.top) / rect.height - 0.5),
      )
      hasPointer = true
    }

    if (!reduced) window.addEventListener('pointermove', handlePointerMove, { passive: true })

    const clock = new THREE.Clock()
    let elapsed = 0

    const renderFrame = () => {
      renderer.render(scene, camera)
    }

    const tick = () => {
      elapsed += Math.min(clock.getDelta(), 0.05)
      uniforms.uTime.value = elapsed
      if (hasPointer) uniforms.uPointer.value.lerp(pointerTarget, 0.045)
      renderFrame()
    }

    // Reduced motion gets a single static frame instead of a live loop.
    let running = false
    const start = () => {
      if (running || reduced) return
      running = true
      clock.getDelta()
      renderer.setAnimationLoop(tick)
    }
    const stop = () => {
      running = false
      renderer.setAnimationLoop(null)
    }

    if (reduced) renderFrame()
    else start()

    // Nothing below the fold needs a fullscreen noise shader still burning GPU.
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start()
        else stop()
      },
      { threshold: 0 },
    )
    intersectionObserver.observe(mount)

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = mount.clientWidth || window.innerWidth
      const nextHeight = mount.clientHeight || window.innerHeight
      renderer.setSize(nextWidth, nextHeight)
      uniforms.uAspect.value = nextWidth / nextHeight
      if (reduced) renderFrame()
    })
    resizeObserver.observe(mount)

    return () => {
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
      stop()
      window.removeEventListener('pointermove', handlePointerMove)
      mesh.geometry.dispose()
      mesh.material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [mountRef, reduced])
}
