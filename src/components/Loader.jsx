import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion as Motion, useReducedMotion } from 'framer-motion'

const EASE_OUT = [0.16, 1, 0.3, 1]
const EASE_SNAP = [0.76, 0, 0.24, 1]
const WORD = 'ENTERING'

const TIMING = {
  full: { count: 1600, handoff: 320, reveal: 1050, wipe: 0.8, stagger: 0.055 },
  reduced: { count: 0, handoff: 120, reveal: 260, wipe: 0.25, stagger: 0 },
}

export default function Loader({ onReveal, onComplete }) {
  const reduced = useReducedMotion()
  const timing = reduced ? TIMING.reduced : TIMING.full

  const [phase, setPhase] = useState('count')
  const [count, setCount] = useState(reduced ? 100 : 0)

  // Kept in a ref so the phase effect below does not re-run when the parent
  // re-renders with a fresh callback identity.
  const onRevealRef = useRef(onReveal)
  useEffect(() => {
    onRevealRef.current = onReveal
  })

  // Wake the hero as the panel starts lifting, so it is mid-entrance by the
  // time it is uncovered rather than sitting blank behind the wipe.
  useEffect(() => {
    if (phase === 'wipe') onRevealRef.current?.()
  }, [phase])

  // Land at the top before locking. A programmatic scroll against a locked
  // viewport is a no-op, and 'instant' is explicit so the jump does not
  // inherit `scroll-behavior: smooth` from index.css.
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  // Release on cleanup too, so an unmount before the wipe cannot strand the
  // page unscrollable.
  useEffect(() => {
    if (phase === 'wipe' || phase === 'done') return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'count') return undefined

    let raf = 0
    let timer = 0

    if (reduced) {
      timer = setTimeout(() => setPhase('reveal'), timing.handoff)
      return () => clearTimeout(timer)
    }

    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / timing.count, 1)
      setCount(Math.round((1 - Math.pow(1 - progress, 3)) * 100))
      if (progress < 1) raf = requestAnimationFrame(tick)
      else timer = setTimeout(() => setPhase('reveal'), timing.handoff)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [phase, reduced, timing.count, timing.handoff])

  useEffect(() => {
    if (phase !== 'reveal') return undefined
    const timer = setTimeout(() => setPhase('wipe'), timing.reveal)
    return () => clearTimeout(timer)
  }, [phase, timing.reveal])

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {phase !== 'done' && (
        <Motion.div
          key="loader"
          className="loader"
          exit={{ opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
        >
          <AnimatePresence>
            {phase === 'count' && (
              <Motion.div
                key="hud"
                className="loader-hud"
                exit={{ opacity: 0, y: -6, transition: { duration: 0.35, ease: EASE_OUT } }}
              >
                <Motion.div
                  className="loader-brand"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.55, ease: EASE_OUT }}
                >
                  <span className="loader-dot" />
                  <span>Anubhav.dev</span>
                </Motion.div>

                <Motion.div
                  className="loader-progress"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                >
                  <div className="loader-progress-row">
                    <span className="loader-progress-label">Loading</span>
                    <span
                      className="loader-count"
                      data-warm={count >= 80 ? 'true' : 'false'}
                    >
                      {String(count).padStart(3, '0')}
                    </span>
                  </div>

                  <div className="loader-track">
                    <div
                      className="loader-track-fill"
                      style={{ transform: `scaleX(${count / 100})` }}
                    />
                    <div
                      className="loader-track-head"
                      style={{ left: `${count}%`, opacity: count > 2 ? 1 : 0 }}
                    />
                  </div>
                </Motion.div>
              </Motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {phase === 'reveal' && (
              <Motion.div
                key="reveal"
                className="loader-reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div className="loader-word">
                  {[...WORD].map((char, index) => (
                    <Motion.span
                      key={index}
                      className="loader-letter"
                      initial={reduced ? { opacity: 0 } : { y: '110%', opacity: 0 }}
                      animate={reduced ? { opacity: 1 } : { y: '0%', opacity: 1 }}
                      transition={{
                        duration: reduced ? 0.2 : 0.55,
                        ease: EASE_OUT,
                        delay: index * timing.stagger,
                      }}
                    >
                      {char}
                    </Motion.span>
                  ))}
                </div>

                <Motion.div
                  className="loader-rule"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.55, ease: EASE_OUT, delay: reduced ? 0 : 0.42 }}
                />

                <Motion.span
                  className="loader-tagline"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT, delay: reduced ? 0 : 0.6 }}
                >
                  Portfolio 2026
                </Motion.span>
              </Motion.div>
            )}
          </AnimatePresence>

          {phase === 'wipe' && (
            <Motion.div
              className="loader-wipe"
              initial={reduced ? { opacity: 1 } : { y: '0%' }}
              animate={reduced ? { opacity: 0 } : { y: '-100%' }}
              transition={{
                duration: timing.wipe,
                ease: reduced ? 'easeOut' : EASE_SNAP,
                delay: reduced ? 0 : 0.05,
              }}
              onAnimationComplete={() => setPhase('done')}
            />
          )}
        </Motion.div>
      )}
    </AnimatePresence>
  )
}
