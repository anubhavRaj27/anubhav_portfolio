import { useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import useHeroAvatar from '../hooks/useHeroAvatar.js'

export default function HeroAvatar({ active }) {
  const mountRef = useRef(null)
  const reduced = useReducedMotion()
  const triggerWave = useHeroAvatar(mountRef, { active, reduced: Boolean(reduced) })

  return (
    <div
      ref={mountRef}
      className="hero-avatar"
      aria-hidden="true"
      onPointerEnter={triggerWave}
      onClick={triggerWave}
    />
  )
}
