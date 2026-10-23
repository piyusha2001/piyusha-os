import { useEffect, useState } from 'react';
import { useOS, WALLPAPERS } from '../os.js';
import { APPS, DESKTOP_APPS } from '../apps/registry.js';
import AppIcon from './AppIcon.jsx';
import profile from '../data/profile.json';

export default function Desktop() {
  const { openApp, wallpaper, setWallpaper } = useOS();
  const [selected, setSelected] = useState(null);
  const [menu, setMenu] = useState(null);
  const [noteOpen, setNoteOpen] = useState(true);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [menu]);

  const touch = window.matchMedia('(hover: none)').matches;
  const nextWallpaper = () => {
    const ids = Object.keys(WALLPAPERS);
    setWallpaper(ids[(ids.indexOf(wallpaper) + 1) % ids.length]);
  };

  return (
    <main
      className="desktop"
      onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}
      onContextMenu={(e) => {
        e.preventDefault();
        setMenu({ x: Math.min(e.clientX, window.innerWidth - 220), y: Math.min(e.clientY, window.innerHeight - 200) });
      }}
    >
      <div className="desktop-icons">
        {DESKTOP_APPS.map((appId) => (
          <button
            key={appId}
            className={`desktop-icon ${selected === appId ? 'selected' : ''}`}
            onClick={() => (touch ? openApp(appId) : setSelected(appId))}
            onDoubleClick={() => openApp(appId)}
            onKeyDown={(e) => e.key === 'Enter' && openApp(appId)}
          >
            <AppIcon appId={appId} size={54} />
            <span className="desktop-label">{APPS[appId].title}</span>
          </button>
        ))}
      </div>

      {noteOpen && (
        <aside className="sticky-note">
          <button className="sticky-close" onClick={() => setNoteOpen(false)} aria-label="Dismiss note">×</button>
          <strong>Hej! 👋 I'm {profile.name.split(' ')[0]}.</strong>
          <p>Welcome to my little OS. {touch ? 'Tap' : 'Double-click'} an icon to open an app, or try the <b>Terminal</b> and type <code>help</code>.</p>
          <p className="sticky-sig">MSc CS @ KTH · LLM research</p>
        </aside>
      )}

      {menu && (
        <div className="dropdown context" style={{ left: menu.x, top: menu.y }} onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={() => { setMenu(null); openApp('terminal'); }}>Open Terminal Here</button>
          <button onClick={() => { setMenu(null); nextWallpaper(); }}>Next Wallpaper</button>
          <button onClick={() => { setMenu(null); openApp('settings'); }}>Change Wallpaper…</button>
          <hr />
          <button onClick={() => { setMenu(null); openApp('resume'); }}>Get Info… (Resume)</button>
          <button onClick={() => { setMenu(null); setNoteOpen(true); }}>Show Welcome Note</button>
        </div>
      )}
    </main>
  );
}
