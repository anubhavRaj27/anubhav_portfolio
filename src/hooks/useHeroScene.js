import { useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

class Blob {
  constructor(renderer, width, height, globalUniforms) {
    this.renderer = renderer
    this.globalUniforms = globalUniforms
    this.copyPosition = new THREE.Vector2(0, 0)
    this.fbTexture = { value: new THREE.FramebufferTexture(width, height) }
    this.rtOutput = new THREE.WebGLRenderTarget(width, height)
    this.uniforms = {
      pointer: { value: new THREE.Vector2().setScalar(10) },
      pointerDown: { value: 1 },
      pointerRadius: { value: 0.375 },
      pointerDuration: { value: 2.5 },
    }

    this.handlePointerMove = (event) => {
      const rect = renderer.domElement.getBoundingClientRect()
      this.uniforms.pointer.value.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      this.uniforms.pointer.value.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    }

    this.handlePointerLeave = () => {
      this.uniforms.pointer.value.setScalar(10)
    }

    window.addEventListener('pointermove', this.handlePointerMove)
    renderer.domElement.addEventListener('pointerleave', this.handlePointerLeave)

    this.rtScene = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        onBeforeCompile: (shader) => {
          shader.uniforms.dTime = this.globalUniforms.dTime
          shader.uniforms.aspect = this.globalUniforms.aspect
          shader.uniforms.pointer = this.uniforms.pointer
          shader.uniforms.pointerDown = this.uniforms.pointerDown
          shader.uniforms.pointerRadius = this.uniforms.pointerRadius
          shader.uniforms.pointerDuration = this.uniforms.pointerDuration
          shader.uniforms.fbTexture = this.fbTexture
          shader.fragmentShader = `
            uniform float dTime;
            uniform float aspect;
            uniform vec2 pointer;
            uniform float pointerDown;
            uniform float pointerRadius;
            uniform float pointerDuration;
            uniform sampler2D fbTexture;

            ${shader.fragmentShader}
          `.replace(
            '#include <color_fragment>',
            `#include <color_fragment>

            float duration = pointerDuration;
            float rVal = texture2D(fbTexture, vUv).r;

            rVal -= clamp(dTime / duration, 0., 0.1);
            rVal = clamp(rVal, 0., 1.);

            float f = 0.;
            if (pointerDown > 0.5){
              vec2 uv = (vUv - 0.5) * 2. * vec2(aspect, 1.);
              vec2 mouse = pointer * vec2(aspect, 1.);
              f = 1. - smoothstep(pointerRadius * 0.1, pointerRadius, distance(uv, mouse));
            }

            rVal += f * 0.1;
            rVal = clamp(rVal, 0., 1.);
            diffuseColor.rgb = vec3(rVal);
            `,
          )
        },
      }),
    )

    this.rtScene.material.defines = { USE_UV: '' }
    this.rtCamera = new THREE.Camera()
  }

  render() {
    this.renderer.setRenderTarget(this.rtOutput)
    this.renderer.render(this.rtScene, this.rtCamera)
    this.renderer.copyFramebufferToTexture(this.fbTexture.value, this.copyPosition)
    this.renderer.setRenderTarget(null)
  }

  setSize(width, height) {
    this.rtOutput.setSize(width, height)
    this.fbTexture.value.dispose()
    this.fbTexture.value = new THREE.FramebufferTexture(width, height)
  }

  dispose() {
    window.removeEventListener('pointermove', this.handlePointerMove)
    this.renderer.domElement.removeEventListener('pointerleave', this.handlePointerLeave)
    this.rtScene.geometry.dispose()
    this.rtScene.material.dispose()
    this.rtOutput.dispose()
    this.fbTexture.value.dispose()
  }
}

export default function useHeroScene(mountRef) {
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    let isDisposed = false

    const globalUniforms = {
      time: { value: 0 },
      dTime: { value: 0 },
      aspect: { value: mount.clientWidth / mount.clientHeight },
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffffff)

    const width = mount.clientWidth || window.innerWidth
    const height = mount.clientHeight || window.innerHeight

    const camera = new THREE.PerspectiveCamera(30, width / height, 1, 100)
    camera.position.set(-1, 0, 0).setLength(15)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height)
    mount.appendChild(renderer.domElement)

    // The render loop only starts once both remote models resolve, and the
    // renderer is opaque by default, so without this the canvas composites as
    // black until then. Match .hero-section so a slow load degrades to a flat
    // cream field instead.
    renderer.setClearColor(0xf8f8f4, 1)
    renderer.clear()

    const camShift = new THREE.Vector3(0, 1, 0)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.object.position.add(camShift)
    controls.target.add(camShift)

    const light = new THREE.AmbientLight(0xffffff, Math.PI)
    scene.add(light)

    const blob = new Blob(renderer, width, height, globalUniforms)
    const loader = new GLTFLoader()
    const clock = new THREE.Clock()
    let elapsed = 0
    let helmetMaterial = null

    const handleResize = () => {
      const nextWidth = mount.clientWidth || window.innerWidth
      const nextHeight = mount.clientHeight || window.innerHeight
      camera.aspect = nextWidth / nextHeight
      camera.updateProjectionMatrix()
      renderer.setSize(nextWidth, nextHeight)
      globalUniforms.aspect.value = camera.aspect
      blob.setSize(nextWidth, nextHeight)

      if (helmetMaterial?.userData.shader) {
        helmetMaterial.userData.shader.uniforms.texBlob.value = blob.rtOutput.texture
      }
    }

    window.addEventListener('resize', handleResize)

    ;(async () => {
      try {
        const headGltf = await loader.loadAsync(
          'https://threejs.org/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb',
        )
        if (isDisposed) return

        const head = headGltf.scene.children[0]
        head.geometry.rotateY(Math.PI * 0.01)
        head.material = new THREE.MeshMatcapMaterial({ color: 0xffffff })
        scene.add(head)

        const helmetGltf = await loader.loadAsync(
          'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF/DamagedHelmet.gltf',
        )
        if (isDisposed) return

        const helmet = helmetGltf.scene.children[0]
        helmetMaterial = helmet.material
        const helmetUniforms = {
          texBlob: { value: blob.rtOutput.texture },
        }

        helmet.material.onBeforeCompile = (shader) => {
          shader.uniforms.texBlob = helmetUniforms.texBlob
          helmet.material.userData.shader = shader
          shader.vertexShader = `
            varying vec4 vPosProj;
            ${shader.vertexShader}
          `.replace(
            '#include <project_vertex>',
            `#include <project_vertex>
              vPosProj = gl_Position;
            `,
          )

          shader.fragmentShader = `
            uniform sampler2D texBlob;
            varying vec4 vPosProj;
            ${shader.fragmentShader}
          `.replace(
            '#include <clipping_planes_fragment>',
            `
            vec2 blobUV = ((vPosProj.xy / vPosProj.w) + 1.) * 0.5;
            vec4 blobData = texture(texBlob, blobUV);

            if (blobData.r < 0.01) discard;

            #include <clipping_planes_fragment>
            `,
          )
        }

        helmet.material.needsUpdate = true
        helmet.scale.setScalar(3.5)
        helmet.position.set(0, 1.5, 0.75)
        scene.add(helmet)

        const helmetWire = new THREE.Mesh(
          helmet.geometry.clone().rotateX(Math.PI * 0.5),
          new THREE.MeshBasicMaterial({
            color: 0x000000,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
            onBeforeCompile: (shader) => {
              shader.uniforms.time = globalUniforms.time
              shader.vertexShader = `
                varying float vYVal;
                ${shader.vertexShader}
              `.replace(
                '#include <begin_vertex>',
                `#include <begin_vertex>
                  vYVal = position.y;
                `,
              )

              shader.fragmentShader = `
                uniform float time;
                varying float vYVal;
                ${shader.fragmentShader}
              `.replace(
                '#include <color_fragment>',
                `#include <color_fragment>
                  float y = fract(vYVal * 0.25 + time * 0.5);
                  float fY = smoothstep(0., 0.01, y) - smoothstep(0.02, 0.1, y);
                  diffuseColor.a *= fY * 0.9 + 0.1;
                `,
              )
            },
          }),
        )

        helmetWire.scale.setScalar(3.5)
        helmetWire.position.set(0, 1.5, 0.75)
        scene.add(helmetWire)

        renderer.setAnimationLoop(() => {
          const dt = clock.getDelta()
          elapsed += dt
          globalUniforms.time.value = elapsed
          globalUniforms.dTime.value = dt
          controls.update()
          blob.render()
          renderer.render(scene, camera)
        })
      } catch (error) {
        console.error('Failed to initialize Three.js scene', error)
      }
    })()

    return () => {
      isDisposed = true
      window.removeEventListener('resize', handleResize)
      renderer.setAnimationLoop(null)
      controls.dispose()
      blob.dispose()
      scene.traverse((object) => {
        if (object.isMesh) {
          object.geometry?.dispose?.()
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose?.())
          } else {
            object.material?.dispose?.()
          }
        }
      })
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [mountRef])
}
