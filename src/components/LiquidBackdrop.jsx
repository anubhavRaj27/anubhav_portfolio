import { useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import useLiquidBackdrop from '../hooks/useLiquidBackdrop.js'

export default function LiquidBackdrop() {
  const mountRef = useRef(null)
  const reduced = useReducedMotion()

  useLiquidBackdrop(mountRef, { reduced: Boolean(reduced) })

  return <div ref={mountRef} className="liquid-root" aria-hidden="true" />
}
