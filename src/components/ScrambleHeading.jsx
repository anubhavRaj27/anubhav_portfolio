import { useEffect, useRef, useState } from 'react'

const GLITCH_CHARS = 'ABCDEFGHKNOPRSTUVXZ0123456789#$%&/<>[]{}'
const DURATION = 800

/**
 * Decodes `text` out of random glyphs, left to right.
 *
 * Every character keeps its own cell, sized by a hidden copy of its final
 * glyph, so the heading occupies exactly the same width on every frame. The
 * split markup stays mounted after the animation finishes: collapsing back to
 * a plain text node would restore kerning pairs and nudge the line sideways.
 */
export default function ScrambleHeading({ text, active, className }) {
  const chars = [...text]
  // null means "at rest": the overlay is unmounted and the real glyphs show,
  // so the heading's text content is the actual name for crawlers and copy.
  const [display, setDisplay] = useState(null)
  const rafRef = useRef(0)

  useEffect(() => {
    if (!active) return undefined

    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / DURATION, 1)
      if (progress >= 1) {
        setDisplay(null)
        return
      }
      setDisplay(
        chars.map((char, index) =>
          char === ' ' || index / chars.length < progress
            ? char
            : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)],
        ),
      )
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, text])

  return (
    <h1 className={className} aria-label={text}>
      <span
        className="scramble"
        aria-hidden="true"
        data-scrambling={display ? 'true' : 'false'}
      >
        {chars.map((char, index) => (
          <span key={index} className="scramble-cell">
            <span className="scramble-ghost">{char}</span>
            {display && <span className="scramble-live">{display[index]}</span>}
          </span>
        ))}
      </span>
    </h1>
  )
}
