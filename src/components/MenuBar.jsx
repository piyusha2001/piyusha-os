import { useEffect, useRef, useState } from 'react';
import { Wifi, BatteryFull, Search } from 'lucide-react';
import { useOS } from '../os.js';
import { APPS } from '../apps/registry.js';

export default function MenuBar() {
  const { windows, activeId, openApp, logout, reboot, closeAll } = useOS();
  const [now, setNow] = useState(new Date());
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 15);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => !ref.current?.contains(e.target) && setMenuOpen(false);
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [menuOpen]);

  const active = windows.find((w) => w.id === activeId);
  const run = (fn) => () => { setMenuOpen(false); fn(); };

  return (
    <header className="menubar">
      <div className="menubar-left" ref={ref}>
        <button className={`menu-logo ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen((o) => !o)} aria-label="System menu">
          <span className="logo-mark">◐</span>
        </button>
        <span className="menu-app">{active ? APPS[active.appId].title : 'PiyushaOS'}</span>
        <button className="menu-item hide-sm" onClick={() => openApp('projects')}>Projects</button>
        <button className="menu-item hide-sm" onClick={() => openApp('resume')}>Resume</button>
        <button className="menu-item hide-sm" onClick={() => openApp('contact')}>Contact</button>

        {menuOpen && (
          <div className="dropdown">
            <button onClick={run(() => openApp('about'))}>About Piyusha</button>
            <button onClick={run(() => openApp('settings'))}>System Settings…</button>
            <button onClick={run(() => openApp('terminal'))}>Open Terminal</button>
            <hr />
            <button onClick={run(closeAll)}>Close All Windows</button>
            <button onClick={run(reboot)}>Restart…</button>
            <button onClick={run(logout)}>Log Out Guest…</button>
          </div>
        )}
      </div>
      <div className="menubar-right">
        <button className="menu-item" onClick={() => openApp('terminal')} title="Open terminal" aria-label="Open terminal">
          <Search size={14} />
        </button>
        <Wifi size={14} className="hide-sm" />
        <BatteryFull size={16} className="hide-sm" />
        <span className="menu-clock">
          <span className="hide-sm">{now.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}&nbsp;&nbsp;</span>
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </header>
  );
}
