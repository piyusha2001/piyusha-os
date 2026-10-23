import { useState } from 'react';
import {
  Brain, Layers, Gauge, Sun, Thermometer, Radio, Sigma, Pizza, Heart, MessageSquare,
  BarChart3, HelpCircle, Wallet, Music, Folder, Github, ExternalLink, ArrowLeft, Star,
} from 'lucide-react';
import profile from '../data/profile.json';

const ICONS = {
  brain: Brain, layers: Layers, gauge: Gauge, sun: Sun, thermometer: Thermometer, radio: Radio,
  sigma: Sigma, pizza: Pizza, heart: Heart, message: MessageSquare, chart: BarChart3,
  help: HelpCircle, wallet: Wallet, music: Music,
};

const AI = ['PyTorch', 'XGBoost', 'Hugging Face', 'ML', 'NumPy', 'Pandas', 'Jupyter', 'Simulation'];
const FILTERS = {
  Featured: (p) => p.featured,
  'AI & ML': (p) => p.stack.some((s) => AI.includes(s)),
  Web: (p) => !p.stack.some((s) => AI.includes(s)),
  All: () => true,
};

export default function Projects() {
  const [filter, setFilter] = useState('Featured');
  const [open, setOpen] = useState(null);
  const items = profile.projects.filter(FILTERS[filter]);
  const project = profile.projects.find((p) => p.name === open);

  return (
    <div className="split">
      <aside className="split-list finder-side">
        <div className="side-head">Favourites</div>
        {Object.keys(FILTERS).map((f) => (
          <button key={f} className={`side-row ${f === filter ? 'on' : ''}`} onClick={() => { setFilter(f); setOpen(null); }}>
            <Folder size={15} /> {f}
            <span className="count">{profile.projects.filter(FILTERS[f]).length}</span>
          </button>
        ))}
        <div className="side-head">Elsewhere</div>
        <a className="side-row" href={`${profile.contact.github}?tab=repositories`} target="_blank" rel="noreferrer">
          <Github size={15} /> All repos ↗
        </a>
      </aside>

      <div className="split-detail">
        {!project ? (
          <div className="proj-grid">
            {items.map((p) => {
              const Icon = ICONS[p.icon] ?? Folder;
              return (
                <button key={p.name} className="proj-card" onClick={() => setOpen(p.name)}>
                  <span className="proj-icon"><Icon size={22} /></span>
                  <strong>{p.name}</strong>
                  <span className="muted small">{p.subtitle}</span>
                  <span className="chips small">{p.stack.slice(0, 3).map((s) => <span key={s} className="chip">{s}</span>)}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <article className="app proj-detail">
            <button className="back" onClick={() => setOpen(null)}><ArrowLeft size={14} /> {filter}</button>
            <h1>{project.name} {project.featured && <Star size={16} className="star" />}</h1>
            <p className="muted">{project.subtitle}{project.date && ` · ${project.date}`}</p>
            <div className="chips">{project.stack.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            <ul className="bullets">{project.points.map((x) => <li key={x}>{x}</li>)}</ul>
            <div className="btn-row">
              {project.repo && <a className="btn primary" href={project.repo} target="_blank" rel="noreferrer"><Github size={14} /> Source</a>}
              {project.demo && <a className="btn" href={project.demo} target="_blank" rel="noreferrer"><ExternalLink size={14} /> Live demo</a>}
              {!project.repo && !project.demo && <span className="muted small">Code private while the paper is under review.</span>}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
