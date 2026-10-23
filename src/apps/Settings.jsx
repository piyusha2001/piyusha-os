import { useOS, WALLPAPERS } from '../os.js';

export default function Settings() {
  const { wallpaper, setWallpaper, reboot } = useOS();
  return (
    <div className="app">
      <h2>Wallpaper</h2>
      <div className="wp-grid">
        {Object.entries(WALLPAPERS).map(([id, w]) => (
          <button key={id} className={`wp-thumb ${id === wallpaper ? 'on' : ''}`} onClick={() => setWallpaper(id)}>
            <span className={`wp-preview ${w.className}`}><span className="blob b1" /><span className="blob b2" /><span className="blob b3" /></span>
            <span className="small">{w.name}</span>
          </button>
        ))}
      </div>
      <h2>About this OS</h2>
      <p className="small muted">PiyushaOS 26.10 · built with React + Vite · no backend, all content lives in <code>src/data/profile.json</code>.</p>
      <button className="btn" onClick={reboot}>Restart PiyushaOS</button>
    </div>
  );
}
