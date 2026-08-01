import { motion as Motion, useReducedMotion } from 'framer-motion'
import {
  contactLinks,
  experiences,
  profile,
  projects,
  services,
  stats,
  techGroups,
} from '../data/content.js'

const EASE_OUT = [0.16, 1, 0.3, 1]

// Reveals fire on scroll rather than on mount, so content further down the page
// is not already spent by the time it is reached.
function Reveal({ children, delay = 0, className, as = 'div' }) {
  const reduced = useReducedMotion()
  const Tag = Motion[as]

  if (reduced) {
    const Plain = as
    return <Plain className={className}>{children}</Plain>
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.75, ease: EASE_OUT, delay }}
    >
      {children}
    </Tag>
  )
}

function SectionHead({ index, label, title, lead }) {
  return (
    <Reveal className="section-head">
      <p className="section-index">
        <span>{index}</span>
        <span className="section-index-rule" />
        <span>{label}</span>
      </p>
      <h2>{title}</h2>
      {lead && <p className="section-lead">{lead}</p>}
    </Reveal>
  )
}

export default function PageSections() {
  return (
    <>
      <section className="panel" id="about">
        <div className="panel-inner">
          <SectionHead
            index="01"
            label="About"
            title={
              <>
                I care how an interface <em>feels</em> as much as how it works.
              </>
            }
          />

          <div className="about-body">
            <Reveal className="about-copy" delay={0.05}>
              <p>{profile.intro}</p>
            </Reveal>

            <Reveal className="stat-stack" delay={0.12}>
              {stats.map((stat) => (
                <div key={stat.label} className="stat">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </Reveal>
          </div>

          <ul className="capability-list">
            {services.map((service, index) => (
              <Reveal as="li" key={service.title} delay={index * 0.06}>
                <span className="capability-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="capability-title">{service.title}</span>
                <span className="capability-rule" />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel" id="experience">
        <div className="panel-inner">
          <SectionHead index="02" label="Experience" title="Where I have been building." />

          <ol className="roles">
            {experiences.map((role, index) => (
              <Reveal as="li" key={`${role.title}-${role.date}`} delay={index * 0.06}>
                <div className="role-meta">
                  <span className="role-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="role-date">{role.date}</span>
                </div>
                <div className="role-body">
                  <h3>{role.title}</h3>
                  <p className="role-company">{role.company}</p>
                  <ul>
                    {role.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="panel" id="work">
        <div className="panel-inner">
          <SectionHead
            index="03"
            label="Work"
            title="Things I shipped end to end."
            lead="From data model through to the last interaction detail."
          />

          <div className="projects">
            {projects.map((project, index) => (
              <Reveal as="article" key={project.name} className="project" delay={index * 0.05}>
                <a className="project-shot" href={project.link} target="_blank" rel="noreferrer">
                  <img src={project.image} alt={`${project.name} interface`} />
                  <span className="project-shot-label">
                    {project.name} / preview
                  </span>
                </a>

                <div className="project-info">
                  <span className="project-index">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <p className="project-stack">
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </p>
                  <a className="arrow-link" href={project.link} target="_blank" rel="noreferrer">
                    View source <span aria-hidden="true">&#8599;</span>
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="panel" id="tech">
        <div className="panel-inner">
          <SectionHead index="04" label="Stack" title="What I reach for." />

          <div className="stack-grid">
            {techGroups.map((group, index) => (
              <Reveal key={group.title} className="stack-group" delay={index * 0.07}>
                <p className="stack-count">
                  {String(index + 1).padStart(2, '0')} &mdash; {String(techGroups.length).padStart(2, '0')}
                </p>
                <h3>{group.title}</h3>
                <p className="stack-subtitle">{group.subtitle}</p>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="panel contact-panel" id="contact">
        <div className="panel-inner">
          <SectionHead
            index="05"
            label="Contact"
            title={
              <>
                Let&apos;s build something
                <br />
                worth shipping.
              </>
            }
            lead="Or just say hello. No agenda required."
          />

          <ul className="contact-list">
            {contactLinks.map((link, index) => (
              <Reveal as="li" key={link.label} delay={index * 0.06}>
                <a href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                  <span className="contact-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="contact-label">{link.label}</span>
                  <span className="contact-value">{link.value}</span>
                  <span className="contact-arrow" aria-hidden="true">&#8599;</span>
                </a>
              </Reveal>
            ))}
          </ul>

          <footer className="site-footer">
            <span>{profile.name}</span>
            <span>
              Based in {profile.location} &middot; {profile.availability}
            </span>
          </footer>
        </div>
      </section>
    </>
  )
}
