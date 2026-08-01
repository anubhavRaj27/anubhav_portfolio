import { motion as Motion, useReducedMotion } from 'framer-motion'
import ScrambleHeading from './ScrambleHeading.jsx'
import { profile } from '../data/content.js'

const navItems = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
]

const EASE_OUT = [0.16, 1, 0.3, 1]

const rise = (visible, delay, distance = 20) => ({
  initial: { opacity: 0, y: distance },
  animate: visible ? { opacity: 1, y: 0 } : {},
  transition: { duration: 0.7, ease: EASE_OUT, delay },
})

export default function HeroOverlay({ visible }) {
  const reduced = useReducedMotion()

  return (
    <div className="hero-overlay">
      <header className="hero-header">
        <Motion.a
          href="#home"
          className="brand-mark"
          aria-label="Portfolio home"
          {...rise(visible, 0, -16)}
        >
          <span>ANUBHAV</span>
          <span>RAJ</span>
        </Motion.a>

        <Motion.nav className="hero-nav" aria-label="Primary" {...rise(visible, 0.1, -16)}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </Motion.nav>

        <Motion.a href="#contact" className="hero-cta" {...rise(visible, 0.18, -16)}>
          Let&apos;s Talk
        </Motion.a>
      </header>

      <Motion.aside
        className="hero-badge"
        aria-label="Quick profile card"
        {...rise(visible, 0.55)}
      >
        <p className="badge-label">Frontend</p>
        <div className="badge-divider" />
        <p className="badge-title">React &amp; TypeScript</p>
        <div className="badge-divider" />
        <p className="badge-note">DecoverHq</p>
      </Motion.aside>

      <div className="hero-copy">
        <Motion.p className="eyebrow" {...rise(visible, 0.12)}>
          {profile.role}
        </Motion.p>

        <Motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.2 }}
        >
          <ScrambleHeading text={profile.name} active={visible && !reduced} />
        </Motion.div>

        <Motion.p className="hero-description" {...rise(visible, 0.45)}>
          {profile.tagline}. Currently building product frontends at DecoverHq with
          React, TypeScript, and a focus on performance.
        </Motion.p>

        <Motion.div className="hero-actions" {...rise(visible, 0.58)}>
          <a href="#work" className="primary-link">
            View Work
          </a>
          <a href="#about" className="secondary-link">
            About Me
          </a>
        </Motion.div>
      </div>
    </div>
  )
}
