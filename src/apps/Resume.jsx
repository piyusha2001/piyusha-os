import { Download, ExternalLink } from 'lucide-react';
import profile from '../data/profile.json';

export default function Resume() {
  const src = `${import.meta.env.BASE_URL}${profile.resume}`;
  return (
    <div className="resume">
      <div className="toolbar">
        <span className="muted small">{profile.resume}</span>
        <div className="btn-row">
          <a className="btn sm" href={src} target="_blank" rel="noreferrer"><ExternalLink size={12} /> Open</a>
          <a className="btn sm primary" href={src} download><Download size={12} /> Download</a>
        </div>
      </div>
      <iframe title="Resume" src={`${src}#view=FitH`} />
    </div>
  );
}
