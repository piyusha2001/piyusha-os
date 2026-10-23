import { useRef } from 'react';
import { useOS } from '../os.js';
import { APPS } from '../apps/registry.js';
import AppIcon from './AppIcon.jsx';

const MIN_W = 320;
const MIN_H = 220;

export default function Window({ win, active }) {
  const { closeWindow, focusWindow, updateWindow } = useOS();
  const app = APPS[win.appId];
  const Body = app.component;
  const drag = useRef(null);

  // Shared pointer-drag helper for moving and resizing.
  const startDrag = (e, mode) => {
    if (win.maximized || e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    focusWindow(win.id);
    drag.current = { mode, sx: e.clientX, sy: e.clientY, x: win.x, y: win.y, w: win.w, h: win.h };
    const move = (ev) => {
      const d = drag.current;
      const dx = ev.clientX - d.sx;
      const dy = ev.clientY - d.sy;
      if (d.mode === 'move') {
        updateWindow(win.id, {
          x: Math.min(Math.max(d.x + dx, -d.w + 120), window.innerWidth - 120),
          y: Math.min(Math.max(d.y + dy, 30), window.innerHeight - 60),
        });
      } else {
        updateWindow(win.id, { w: Math.max(MIN_W, d.w + dx), h: Math.max(MIN_H, d.h + dy) });
      }
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const style = win.maximized
    ? { zIndex: win.z }
    : { zIndex: win.z, left: win.x, top: win.y, width: win.w, height: win.h };

  return (
    <section
      className={`window ${active ? 'active' : ''} ${win.maximized ? 'maximized' : ''} ${win.minimized ? 'minimized' : ''}`}
      style={style}
      onPointerDown={() => !active && focusWindow(win.id)}
      role="dialog"
      aria-label={app.title}
    >
      <div
        className="titlebar"
        onPointerDown={(e) => !e.target.closest('button') && startDrag(e, 'move')}
        onDoubleClick={(e) => !e.target.closest('button') && updateWindow(win.id, { maximized: !win.maximized })}
      >
        <div className="traffic">
          <button className="tl close" onClick={() => closeWindow(win.id)} aria-label="Close" />
          <button className="tl min" onClick={() => updateWindow(win.id, { minimized: true })} aria-label="Minimize" />
          <button className="tl max" onClick={() => updateWindow(win.id, { maximized: !win.maximized })} aria-label="Maximize" />
        </div>
        <div className="title">
          <AppIcon appId={win.appId} size={16} />
          {app.title}
        </div>
      </div>
      <div className="window-body">
        <Body {...win.props} />
      </div>
      {!win.maximized && <div className="resize-handle" onPointerDown={(e) => startDrag(e, 'resize')} />}
    </section>
  );
}
