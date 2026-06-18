import { useRef } from 'react'
import useHeroScene from '../hooks/useHeroScene.js'

export default function HeroScene() {
  const mountRef = useRef(null)

  useHeroScene(mountRef)

  return <div ref={mountRef} className="scene-root" aria-hidden="true" />
}
