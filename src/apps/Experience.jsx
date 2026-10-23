import { useEffect, useState } from 'react';
import { ExternalLink, MapPin, Calendar } from 'lucide-react';
import profile from '../data/profile.json';

export default function Experience({ focus }) {
  const [sel, setSel] = useState(focus ?? profile.experience[0].id);
  useEffect(() => { if (focus) setSel(focus); }, [focus]);
  const e = profile.experience.find((x) => x.id === sel) ?? profile.experience[0];

  return (
    <div className="split">
      <aside className="split-list">
        {profile.experience.map((x) => (
          <button key={x.id} className={`list-row ${x.id === sel ? 'on' : ''}`} onClick={() => setSel(x.id)}>
            <strong>{x.org}</strong>
            <span>{x.role.split(' · ')[0]}</span>
            <span className="muted small">{x.period}</span>
          </button>
        ))}
      </aside>
      <article className="split-detail app" key={e.id}>
        <h1>{e.role}</h1>
        <h3 className="org">{e.org}</h3>
        <div className="meta">
          <span><Calendar size={14} /> {e.period}</span>
          <span><MapPin size={14} /> {e.location}</span>
        </div>
        <div className="chips">{e.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
        <ul className="bullets">{e.points.map((p) => <li key={p}>{p}</li>)}</ul>
        {e.link && <a className="btn" href={e.link} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Learn more</a>}
      </article>
    </div>
  );
}
