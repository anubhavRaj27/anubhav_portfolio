const projects = [
  {
    title: 'Interactive Brand Experiences',
    description: 'Campaign microsites and portfolio builds with immersive hero moments.',
  },
  {
    title: 'Performance Focused Frontends',
    description: 'React interfaces optimized for smooth animation and clean UX.',
  },
  {
    title: 'Reusable UI Systems',
    description: 'Structured components, scalable styling, and maintainable codebases.',
  },
]

export default function PageSections() {
  return (
    <>
      <section className="content-section about-section" id="about">
        <div className="section-inner">
          <p className="section-kicker">About</p>
          <h2>Design-led frontend development with strong motion and interaction detail.</h2>
          <p>
            I build modern web interfaces that balance visual storytelling with solid React
            architecture, clean components, and maintainable patterns.
          </p>
        </div>
      </section>

      <section className="content-section work-section" id="work">
        <div className="section-inner">
          <p className="section-kicker">Work</p>
          <h2>Selected directions for this portfolio.</h2>
          <div className="project-grid">
            {projects.map((project) => (
              <article key={project.title} className="project-card">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section contact-section" id="contact">
        <div className="section-inner">
          <p className="section-kicker">Contact</p>
          <h2>Let&apos;s build something memorable.</h2>
          <p>Available for portfolio projects, frontend builds, and interactive web experiences.</p>
          <a className="contact-link" href="mailto:hello@anubhavraj.dev">
            hello@anubhavraj.dev
          </a>
        </div>
      </section>
    </>
  )
}
