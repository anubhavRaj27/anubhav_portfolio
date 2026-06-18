const navItems = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#contact', label: 'Contact' },
]

export default function HeroOverlay() {
  return (
    <div className="hero-overlay">
      <header className="hero-header">
        <a href="#home" className="brand-mark" aria-label="Portfolio home">
          <span>ANUBHAV</span>
          <span>RAJ</span>
        </a>

        <nav className="hero-nav" aria-label="Primary">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a href="#contact" className="hero-cta">
          Let&apos;s Talk
        </a>
      </header>

      <aside className="hero-badge" aria-label="Quick profile card">
        <p className="badge-label">Frontend</p>
        <div className="badge-divider" />
        <p className="badge-title">React Portfolio</p>
        <div className="badge-divider" />
        <p className="badge-note">Three.js Hero</p>
      </aside>

      <div className="hero-copy">
        <p className="eyebrow">Creative Developer</p>
        <h1>Anubhav Raj</h1>
        <p className="hero-description">
          Building polished portfolio experiences with React, motion, and immersive
          WebGL interactions.
        </p>
        <div className="hero-actions">
          <a href="#work" className="primary-link">
            View Work
          </a>
          <a href="#about" className="secondary-link">
            About Me
          </a>
        </div>
      </div>
    </div>
  )
}
