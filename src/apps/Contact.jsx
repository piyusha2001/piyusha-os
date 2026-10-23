import { useState } from 'react';
import { Send, Github, Linkedin, Link2, Copy, Check } from 'lucide-react';
import profile from '../data/profile.json';

export default function Contact() {
  const [form, setForm] = useState({ name: '', subject: '', body: '' });
  const [copied, setCopied] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // No backend: compose the message in the visitor's own mail client.
  const send = (e) => {
    e.preventDefault();
    const body = `${form.body}\n\n${form.name}`;
    window.location.href = `mailto:${profile.contact.email}?subject=${encodeURIComponent(form.subject || 'Hello from PiyushaOS')}&body=${encodeURIComponent(body)}`;
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked */ }
  };

  return (
    <div className="app contact">
      <form onSubmit={send} className="mail">
        <div className="mail-row"><span>To:</span><b>{profile.contact.email}</b>
          <button type="button" className="icon-btn" onClick={copy} aria-label="Copy email">{copied ? <Check size={14} /> : <Copy size={14} />}</button>
        </div>
        <label className="mail-row"><span>From:</span><input value={form.name} onChange={set('name')} placeholder="Your name" required /></label>
        <label className="mail-row"><span>Subject:</span><input value={form.subject} onChange={set('subject')} placeholder="Let's work together" /></label>
        <textarea value={form.body} onChange={set('body')} placeholder="Hej Piyusha, …" rows={7} required />
        <button className="btn primary" type="submit"><Send size={14} /> Send via mail app</button>
      </form>
      <div className="btn-row">
        <a className="btn" href={profile.contact.github} target="_blank" rel="noreferrer"><Github size={14} /> GitHub</a>
        <a className="btn" href={profile.contact.linkedin} target="_blank" rel="noreferrer"><Linkedin size={14} /> LinkedIn</a>
        <a className="btn" href={profile.contact.bio} target="_blank" rel="noreferrer"><Link2 size={14} /> All links</a>
      </div>
    </div>
  );
}
