import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { APPS } from './apps/registry.js';
import { OSContext, WALLPAPERS, storage } from './os.js';
import BootScreen from './components/BootScreen.jsx';
import LoginScreen from './components/LoginScreen.jsx';
import MenuBar from './components/MenuBar.jsx';
import Dock from './components/Dock.jsx';
import Desktop from './components/Desktop.jsx';
import Window from './components/Window.jsx';

const isMobile = () => window.innerWidth < 720;

function initialRect(appId, count) {
  const [w, h] = APPS[appId].size;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(w, vw - 40);
  const height = Math.min(h, vh - 130);
  const offset = (count % 6) * 28;
  return {
    x: Math.max(20, (vw - width) / 2 - 80 + offset),
    y: Math.max(40, (vh - height) / 2 - 40 + offset),
    w: width,
    h: height,
  };
}

export default function App() {
  const [phase, setPhase] = useState('boot'); // boot → login → desktop
  const [windows, setWindows] = useState([]);
  const [wallpaper, setWallpaperState] = useState(() => storage.get('pos.wallpaper', 'aurora'));
  const zRef = useRef(10);

  const setWallpaper = useCallback((id) => {
    setWallpaperState(id);
    storage.set('pos.wallpaper', id);
  }, []);

  const focusWindow = useCallback((id) => {
    zRef.current += 1;
    const z = zRef.current;
    setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)));
  }, []);

  // One instance per app: opening an app that is already open focuses it (and passes new props).
  const openApp = useCallback((appId, props = {}) => {
    if (!APPS[appId]) return false;
    zRef.current += 1;
    const z = zRef.current;
    setWindows((ws) => {
      const existing = ws.find((w) => w.appId === appId);
      if (existing) {
        return ws.map((w) => (w.id === existing.id ? { ...w, z, minimized: false, props: { ...w.props, ...props } } : w));
      }
      return [
        ...ws,
        { id: `${appId}-${Date.now()}`, appId, z, minimized: false, maximized: isMobile(), props, ...initialRect(appId, ws.length) },
      ];
    });
    return true;
  }, []);

  const closeWindow = useCallback((id) => setWindows((ws) => ws.filter((w) => w.id !== id)), []);
  const updateWindow = useCallback((id, patch) => setWindows((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w))), []);
  const closeAll = useCallback(() => setWindows([]), []);

  const activeId = useMemo(() => {
    const visible = windows.filter((w) => !w.minimized);
    return visible.length ? visible.reduce((a, b) => (a.z > b.z ? a : b)).id : null;
  }, [windows]);

  const os = useMemo(
    () => ({
      windows, openApp, closeWindow, focusWindow, updateWindow, closeAll, activeId,
      wallpaper, setWallpaper,
      logout: () => { closeAll(); setPhase('login'); },
      reboot: () => { closeAll(); setPhase('boot'); },
    }),
    [windows, openApp, closeWindow, focusWindow, updateWindow, closeAll, activeId, wallpaper, setWallpaper]
  );

  // Close the focused window with Escape (unless typing in an input).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && activeId && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        closeWindow(activeId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId, closeWindow]);

  const login = () => {
    setPhase('desktop');
    setTimeout(() => openApp('about'), 350);
  };

  return (
    <OSContext.Provider value={os}>
      <div className={`os ${WALLPAPERS[wallpaper]?.className ?? 'wp-aurora'}`}>
        <div className="wallpaper" aria-hidden="true">
          <span className="blob b1" /><span className="blob b2" /><span className="blob b3" />
        </div>

        {phase === 'boot' && <BootScreen onDone={() => setPhase('login')} />}
        {phase === 'login' && <LoginScreen onLogin={login} />}

        {phase === 'desktop' && (
          <>
            <MenuBar />
            <Desktop />
            {windows.map((w) => (
              <Window key={w.id} win={w} active={w.id === activeId} />
            ))}
            <Dock />
          </>
        )}
      </div>
    </OSContext.Provider>
  );
}
