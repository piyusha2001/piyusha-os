import { useOS } from '../os.js';
import { APPS, DOCK_APPS } from '../apps/registry.js';
import AppIcon from './AppIcon.jsx';

export default function Dock() {
  const { windows, openApp, focusWindow, updateWindow, activeId } = useOS();

  const onClick = (appId) => {
    const win = windows.find((w) => w.appId === appId);
    if (!win) return openApp(appId);
    if (win.id === activeId && !win.minimized) return updateWindow(win.id, { minimized: true });
    focusWindow(win.id);
  };

  return (
    <nav className="dock-wrap">
      <div className="dock">
        {DOCK_APPS.map((appId) => (
          <span key={appId} style={{ display: 'contents' }}>
            {appId === 'settings' && <span className="dock-sep" />}
            <button className="dock-item" onClick={() => onClick(appId)} aria-label={APPS[appId].title}>
              <span className="dock-tip">{APPS[appId].title}</span>
              <AppIcon appId={appId} size={46} />
              {windows.some((w) => w.appId === appId) && <span className="dock-dot" />}
            </button>
          </span>
        ))}
      </div>
    </nav>
  );
}
