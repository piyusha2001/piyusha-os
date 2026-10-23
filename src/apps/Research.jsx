import { ExternalLink, Code2 } from 'lucide-react';
import profile from '../data/profile.json';

export default function Research() {
  return (
    <div className="app">
      <h1>Research & Publications</h1>
      <p className="muted">LLM hallucination detection, evaluation, and, currently, making coding agents spend fewer tokens.</p>
      <div className="pubs">
        {profile.publications.map((p, i) => (
          <article key={p.title} className="pub">
            <div className="pub-num">[{i + 1}]</div>
            <div>
              <div className="pub-status">{p.status}</div>
              <h3>{p.title}</h3>
              <p className="small">{p.authors.split('Piyusha Patil').flatMap((part, j) => (j ? [<b key={j}>Piyusha Patil</b>, part] : [part]))}</p>
              <p className="muted small"><i>{p.venue}</i> · {p.year}</p>
              <div className="btn-row">
                <a className="btn" href={p.link} target="_blank" rel="noreferrer"><ExternalLink size={14} /> {p.linkLabel}</a>
                {p.code && <a className="btn" href={p.code} target="_blank" rel="noreferrer"><Code2 size={14} /> Code</a>}
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="muted small">* equal contribution</p>
    </div>
  );
}
