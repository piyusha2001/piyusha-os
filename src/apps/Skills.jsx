import profile from '../data/profile.json';

export default function Skills() {
  return (
    <div className="app">
      <h1>Skills</h1>
      <p className="muted">What's installed on this machine.</p>
      {Object.entries(profile.skills).map(([group, items]) => (
        <section key={group}>
          <h2>{group}</h2>
          <div className="chips big">{items.map((s) => <span key={s} className="chip">{s}</span>)}</div>
        </section>
      ))}
    </div>
  );
}
