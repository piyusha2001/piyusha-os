import { Trophy, Flag, Rocket, GitPullRequest, Send, Medal, ExternalLink } from 'lucide-react';
import profile from '../data/profile.json';

const ICONS = { trophy: Trophy, flag: Flag, rocket: Rocket, git: GitPullRequest, send: Send, medal: Medal };

export default function Achievements() {
  return (
    <div className="app">
      <h1>Achievements & Leadership</h1>
      <div className="ach-grid">
        {profile.achievements.map((a) => {
          const Icon = ICONS[a.icon] ?? Trophy;
          return (
            <article key={a.title} className="ach">
              <span className="ach-icon"><Icon size={20} /></span>
              <h3>{a.title}</h3>
              <p className="small">{a.detail}</p>
              <div className="btn-row">
                {a.link && <a className="btn sm" href={a.link} target="_blank" rel="noreferrer"><ExternalLink size={12} /> Proof</a>}
                {a.extra && <a className="btn sm" href={a.extra} target="_blank" rel="noreferrer"><ExternalLink size={12} /> {a.extraLabel}</a>}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
