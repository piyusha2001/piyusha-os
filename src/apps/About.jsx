import { MapPin, GraduationCap, Github, Linkedin, Mail, FileText } from 'lucide-react';
import profile from '../data/profile.json';
import { useOS } from '../os.js';

const STATS = [
  ['2.5 yrs', 'at a YC startup'],
  ['3', 'papers'],
  ['🏆', 'IEEE Best Paper'],
  ['9.51', 'B.E. CGPA'],
];

export default function About() {
  const { openApp } = useOS();
  return (
    <div className="app about">
      <div className="about-hero">
        <img src={profile.avatar} alt={profile.name} className="about-avatar" />
        <div>
          <h1>{profile.name}</h1>
          <p className="muted">{profile.title}</p>
          <p className="about-loc"><MapPin size={14} /> {profile.location}</p>
          <div className="btn-row">
            <a className="btn primary" href={profile.contact.github} target="_blank" rel="noreferrer"><Github size={15} /> GitHub</a>
            <a className="btn" href={profile.contact.linkedin} target="_blank" rel="noreferrer"><Linkedin size={15} /> LinkedIn</a>
            <button className="btn" onClick={() => openApp('contact')}><Mail size={15} /> Email</button>
            <button className="btn" onClick={() => openApp('resume')}><FileText size={15} /> Resume</button>
          </div>
        </div>
      </div>

      <p className="tagline">“{profile.tagline}”</p>

      <div className="stats">
        {STATS.map(([v, l]) => (
          <div key={l} className="stat"><strong>{v}</strong><span>{l}</span></div>
        ))}
      </div>

      <section>
        <h2>About</h2>
        {profile.bio.map((p) => <p key={p}>{p}</p>)}
      </section>

      <section>
        <h2>Education</h2>
        {profile.education.map((e) => (
          <div key={e.school} className="edu">
            <GraduationCap size={20} className="edu-icon" />
            <div>
              <strong>{e.school}</strong>
              <div>{e.degree}</div>
              <div className="muted small">{e.period} · {e.note}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
