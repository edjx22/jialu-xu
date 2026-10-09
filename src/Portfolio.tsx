import { useEffect, useState } from 'react';
import GlassNavigation from './GlassNavigation';
import { canis, coecho, education, profile, publications, simulations } from './content';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;
function Authors({ text }: { text: string }) {
  return text.split(/(Jialu Xu)/).map((part, i) => part === 'Jialu Xu' ? <strong key={i}>{part}</strong> : part);
}
function Homepage() {
  return <>
    <section className="about section-width" aria-labelledby="about-title">
      <div className="about-main">
        <div className="about-copy">
          <h1 id="about-title">Jialu Xu</h1>
          <p className="introduction">{profile.introduction} I am advised by <a href="https://uwaterloo.ca/electrical-computer-engineering/profile/z70wang" target="_blank" rel="noopener noreferrer">Prof. Zhou Wang</a> at the <a href="https://ivc.uwaterloo.ca/" target="_blank" rel="noopener noreferrer">IVC Lab</a>, and have also worked with <a href="https://uwaterloo.ca/electrical-computer-engineering/profile/achyu" target="_blank" rel="noopener noreferrer">Prof. Alfred Yu</a> at LITMUS. {profile.priorEducation}</p>
          <div className="research-interests">
            <h2>Research interests</h2>
            <ul>{profile.interests.map(interest => <li key={interest}>{interest}</li>)}</ul>
          </div>
          <p className="contact-note">Interested in my research or a potential collaboration? Feel free to email me at <a href={`mailto:${profile.email}`}>{profile.email}</a>.</p>
        </div>
        <div className="portrait-wrap media-glass">
          {profile.photo ? <img className="portrait" src={asset(profile.photo)} alt="Jialu Xu" /> :
            <div className="portrait portrait-placeholder"><span className="portrait-caption">Photo to be added</span></div>}
        </div>
      </div>
      <section className="education" aria-labelledby="education-title">
        <div className="education-heading"><h2 id="education-title">Education</h2><p>University of Waterloo</p></div>
        <div className="education-list">{education.map(item => <article className="education-entry" key={item.degree}>
          <div className="education-meta"><span className="education-degree">{item.degree}</span><span className="education-dates">{item.dates}</span></div>
          <h3>{item.field}</h3><p>{item.detail}</p>
        </article>)}</div>
      </section>
      <a className="scroll-cue" href="#publications"><span>Selected publications</span><span aria-hidden="true">↓</span></a>
    </section>
    <section className="publications section-width" id="publications" aria-labelledby="publication-title">
      <div className="section-heading"><h2 id="publication-title">Selected publications</h2></div>
      <div className="publication-list">{publications.map(publication => <article className="publication" key={publication.id}>
        <div className="publication-visual">
          <span className="venue-badge">{publication.badge}</span>
          <div className="publication-frame media-glass">{publication.image ? <img src={asset(publication.image)} alt={`Figure from ${publication.title}`} loading="lazy" /> :
            <div className="paper-type"><span>{publication.shortLabel ?? publication.badge}</span></div>}</div>
        </div>
        <div className="publication-copy">
          <h3>{publication.title}</h3><p className="authors"><Authors text={publication.authors} /></p>
          <p className="venue">{publication.venue}{publication.year ? `, ${publication.year}` : ''}</p>
          {publication.status && <p className="publication-status">{publication.status}</p>}
          {publication.links.length > 0 && <div className="paper-links">{publication.links.map(link => <a className="paper-link" key={link.label} href={link.href.startsWith('http') ? link.href : asset(link.href)} target="_blank" rel="noopener noreferrer">{link.label}<span aria-hidden="true">↗</span></a>)}</div>}
        </div>
      </article>)}</div>
    </section>
  </>;
}
function Projects() {
  return <div className="projects section-width">
    <header className="projects-heading"><h1>Projects</h1></header>
    <section className="simulation-section" aria-labelledby="simulation-title">
      <div className="section-heading"><h2 id="simulation-title">Simulation</h2><span className="section-count">05 projects</span></div>
      <p className="suite-introduction">HornSuite — shape the wave, define the coverage. Five tools for horn and compression-driver engineering.</p>
      <div className="simulation-grid">{simulations.map(project => <article className="simulation-card" key={project.id}>
        <div className="simulation-media simulation-glass-window"><img src={asset(project.image)} alt={project.alt} loading="lazy" /></div>
        <div className="simulation-caption"><div className="simulation-title"><img src={asset(project.icon)} alt="" loading="lazy" /><div><h3>{project.title}</h3><p className="simulation-tagline">{project.tagline}</p></div></div><p>{project.description}</p></div>
      </article>)}</div>
    </section>
    <section className="coecho-section" aria-labelledby="coecho-title">
      <div className="coecho-copy"><p className="eyebrow">{coecho.organization}</p><div className="coecho-title"><img className="coecho-logo" src={asset('assets/coecho-logo.png')} alt="" width="64" height="64" loading="lazy" /><h2 id="coecho-title">{coecho.name}</h2></div><p className="coecho-description">{coecho.description}</p><p className="coecho-support">{coecho.support}</p></div>
      <div className="coecho-product"><img src={asset(coecho.image)} alt="Coécho measurement interface with THD+N, spectrum analysis, and measurement evidence" loading="lazy" /></div>
    </section>
    <section className="canis-section" aria-labelledby="canis-title">
      <div className="canis-copy"><p className="eyebrow">{canis.organization}</p><div className="canis-title"><img className="canis-logo" src={asset(canis.logo)} alt="" width="64" height="64" loading="lazy" /><h2 id="canis-title">{canis.name}</h2></div><p className="canis-description">{canis.description}</p></div>
      <div className="canis-product media-glass"><img src={asset(canis.image)} alt="The Pack landing page showing an AI-agent marketplace and a sample task moving through sandboxed execution" loading="lazy" /></div>
    </section>
  </div>;
}
export default function Portfolio() {
  const getPage = () => window.location.hash.startsWith('#/projects') ? 'projects' as const : 'home' as const;
  const [page, setPage] = useState(getPage);
  useEffect(() => {
    const onHash = () => {
      const next = getPage();
      setPage(previous => { if (next !== previous) window.scrollTo({ top: 0, behavior: 'instant' }); return next; });
      if (window.location.hash === '#/') window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => { document.title = `Jialu Xu · ${page === 'home' ? 'Research' : 'Projects'}`; }, [page]);
  return <>
    <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Skip to content</a>
    <div className="ambient-light" aria-hidden="true" />
    <GlassNavigation page={page} />
    <main id="main" key={page} className="page-enter" tabIndex={-1}>{page === 'home' ? <Homepage /> : <Projects />}</main>
    <footer className="footer section-width"><span>© {new Date().getFullYear()} Jialu Xu</span><span>Waterloo, Canada</span></footer>
  </>;
}
