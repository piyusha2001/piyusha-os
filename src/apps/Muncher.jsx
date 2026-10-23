import { useEffect, useRef, useState } from 'react';
import { storage } from '../os.js';
import useGameCanvas, { mix, MONO } from './useGameCanvas.js';

const COLS = 24;
const ROWS = 16;
const K_PER_CELL = 2; // each segment is 2k tokens of context
const LIMIT = 64; // segments, i.e. a 128k context window
const COMPACT_TRIM = 6;
const DIRS = {
  ArrowUp: [0, -1], w: [0, -1], ArrowDown: [0, 1], s: [0, 1],
  ArrowLeft: [-1, 0], a: [-1, 0], ArrowRight: [1, 0], d: [1, 0],
};
const ITEMS = {
  task: { color: '#34d399', glyph: '✓', label: 'Task: +1 solved, +4k tokens' },
  compact: { color: '#c084fc', glyph: '✂', label: 'Compaction: −12k tokens' },
  dump: { color: '#f87171', glyph: '{}', label: 'Verbose tool output: +12k tokens. Dodge it.' },
};
const ENDINGS = {
  wall: 'The agent wandered out of the repo.',
  self: 'The agent got stuck in a loop.',
  overflow: 'Context window exceeded. Should have compacted.',
};

function spawn(g, kind, ttl = Infinity) {
  for (let i = 0; i < 200; i++) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    const taken = g.snake.some((p) => p.x === x && p.y === y) || g.items.some((it) => it.x === x && it.y === y);
    if (!taken) { g.items.push({ kind, x, y, ttl }); return; }
  }
}

function newGame() {
  const g = { snake: [{ x: 6, y: 8 }, { x: 5, y: 8 }, { x: 4, y: 8 }], dir: [1, 0], queue: [], grow: 0, tasks: 0, peak: 3, items: [], popups: [], acc: 0, ticks: 0 };
  spawn(g, 'task');
  return g;
}

const contextOf = (g) => g.snake.length + g.grow;
const tickMs = (tasks) => Math.max(65, 125 - tasks * 2.5);

// Moves the agent one cell; returns an ENDINGS key if the run is over.
function tick(g) {
  if (g.queue.length) g.dir = g.queue.shift();
  const head = { x: g.snake[0].x + g.dir[0], y: g.snake[0].y + g.dir[1] };
  if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS) return 'wall';
  const body = g.grow > 0 ? g.snake : g.snake.slice(0, -1);
  if (body.some((p) => p.x === head.x && p.y === head.y)) return 'self';
  g.snake.unshift(head);
  if (g.grow > 0) g.grow--;
  else g.snake.pop();
  g.ticks++;

  const hit = g.items.findIndex((it) => it.x === head.x && it.y === head.y);
  if (hit >= 0) {
    const [it] = g.items.splice(hit, 1);
    const pop = (text) => g.popups.push({ x: it.x, y: it.y, text, color: ITEMS[it.kind].color, age: 0 });
    if (it.kind === 'task') {
      g.tasks++;
      g.grow += 2;
      pop('+1 task');
      spawn(g, 'task');
      if (g.tasks % 5 === 0 && !g.items.some((i) => i.kind === 'compact')) spawn(g, 'compact', 80);
    } else if (it.kind === 'dump') {
      g.grow += 6;
      pop('+12k');
    } else {
      const fromGrow = Math.min(COMPACT_TRIM, g.grow);
      g.grow -= fromGrow;
      g.snake.splice(Math.max(3, g.snake.length - (COMPACT_TRIM - fromGrow)));
      pop('−12k');
    }
  }

  g.items.forEach((it) => { it.ttl--; });
  g.items = g.items.filter((it) => it.ttl > 0);
  const dumps = g.items.filter((it) => it.kind === 'dump').length;
  if (g.tasks >= 2 && dumps < Math.min(4, 1 + Math.floor(g.tasks / 4)) && Math.random() < 0.04) spawn(g, 'dump', 90);
  g.peak = Math.max(g.peak, contextOf(g));
  return contextOf(g) >= LIMIT ? 'overflow' : null;
}

function cellPath(ctx, x, y, size, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, size, size, r);
}

export default function Muncher() {
  const game = useRef(newGame());
  const phaseRef = useRef('ready');
  const [phase, setPhaseState] = useState('ready'); // ready | play | paused | over
  const [hud, setHud] = useState({ tasks: 0, ctx: 3 });
  const [ending, setEnding] = useState(null);
  const [best, setBest] = useState(() => storage.get('pos.muncher.best', 0));
  const [focused, setFocused] = useState(false);
  const wrap = useRef(null);
  const swipe = useRef(null);

  const setPhase = (p) => { phaseRef.current = p; setPhaseState(p); };
  const focus = () => wrap.current?.focus({ preventScroll: true });
  useEffect(focus, []);

  const start = () => {
    game.current = newGame();
    setHud({ tasks: 0, ctx: 3 });
    setEnding(null);
    setPhase('play');
    focus();
  };
  const togglePause = () => {
    setPhase(phaseRef.current === 'play' ? 'paused' : 'play');
    focus();
  };

  // Queue up to two turns so quick double-taps aren't lost; ignore reversing into yourself.
  const steer = ([dx, dy]) => {
    const g = game.current;
    const [lx, ly] = g.queue.at(-1) ?? g.dir;
    if (g.queue.length >= 2 || (dx === -lx && dy === -ly) || (dx === lx && dy === ly)) return;
    g.queue.push([dx, dy]);
  };

  const finish = (reason) => {
    const g = game.current;
    setPhase('over');
    setEnding(reason);
    setHud({ tasks: g.tasks, ctx: contextOf(g) });
    setBest((b) => {
      const next = Math.max(b, g.tasks);
      storage.set('pos.muncher.best', next);
      return next;
    });
  };

  const canvasRef = useGameCanvas((ctx, w, h, dt) => {
    const g = game.current;
    if (phaseRef.current === 'play') {
      g.acc += dt * 1000;
      let ended = false;
      while (!ended && g.acc >= tickMs(g.tasks)) {
        g.acc -= tickMs(g.tasks);
        const reason = tick(g);
        if (reason) { finish(reason); ended = true; }
      }
      if (!ended) setHud((prev) => (prev.tasks === g.tasks && prev.ctx === contextOf(g) ? prev : { tasks: g.tasks, ctx: contextOf(g) }));
    }
    g.popups.forEach((p) => { p.age += dt; });
    g.popups = g.popups.filter((p) => p.age < 0.9);

    const cell = Math.floor(Math.min((w - 16) / COLS, (h - 16) / ROWS));
    const ox = Math.round((w - cell * COLS) / 2);
    const oy = Math.round((h - cell * ROWS) / 2);
    const hot = contextOf(g) / LIMIT > 0.75;

    ctx.fillStyle = '#05060c';
    ctx.fillRect(0, 0, w, h);
    ctx.beginPath();
    ctx.roundRect(ox, oy, cell * COLS, cell * ROWS, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = hot ? `rgba(248,113,113,${0.45 + 0.35 * Math.sin(performance.now() / 140)})` : 'rgba(255,255,255,0.09)';
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) ctx.fillRect(ox + x * cell + cell / 2 - 1, oy + y * cell + cell / 2 - 1, 2, 2);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const it of g.items) {
      if (it.ttl < 20 && Math.floor(g.ticks / 2) % 2) continue; // blink before disappearing
      const { color, glyph } = ITEMS[it.kind];
      const pad = cell * 0.12;
      cellPath(ctx, ox + it.x * cell + pad, oy + it.y * cell + pad, cell - pad * 2, cell * 0.22);
      ctx.fillStyle = `${color}33`;
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = `700 ${Math.round(cell * (glyph.length > 1 ? 0.4 : 0.55))}px ${MONO}`;
      ctx.fillText(glyph, ox + it.x * cell + cell / 2, oy + it.y * cell + cell / 2 + 1);
    }

    for (let i = g.snake.length - 1; i >= 0; i--) {
      const p = g.snake[i];
      ctx.fillStyle = i === 0 ? '#a5b8ff' : mix([124, 156, 255], [52, 66, 130], i / Math.max(1, g.snake.length - 1));
      cellPath(ctx, ox + p.x * cell + 1.5, oy + p.y * cell + 1.5, cell - 3, cell * 0.28);
      ctx.fill();
    }
    const head = g.snake[0];
    const [dx, dy] = g.dir;
    ctx.fillStyle = '#0b1020';
    for (const side of [-1, 1]) {
      const ex = ox + head.x * cell + cell / 2 + dx * cell * 0.18 - dy * cell * 0.17 * side;
      const ey = oy + head.y * cell + cell / 2 + dy * cell * 0.18 + dx * cell * 0.17 * side;
      ctx.beginPath(); ctx.arc(ex, ey, cell * 0.08, 0, Math.PI * 2); ctx.fill();
    }

    ctx.font = `600 12px ${MONO}`;
    for (const p of g.popups) {
      ctx.globalAlpha = 1 - p.age / 0.9;
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, ox + p.x * cell + cell / 2, oy + p.y * cell - p.age * 30);
    }
    ctx.globalAlpha = 1;
  });

  const onKeyDown = (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const p = phaseRef.current;
    if (DIRS[key]) {
      e.preventDefault();
      if (p === 'over') return; // don't restart by accident while mashing keys at the end
      if (p === 'ready') start();
      if (p === 'paused') setPhase('play');
      steer(DIRS[key]);
    } else if (key === ' ' || key === 'Enter' || key === 'p') {
      e.preventDefault();
      if (p === 'play' || p === 'paused') togglePause();
      else start();
    }
  };

  const onPointerDown = (e) => {
    if (e.target.closest('button')) return;
    focus();
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || phaseRef.current !== 'play') return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    steer(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
  };

  return (
    <div ref={wrap} className="game" tabIndex={0} onKeyDown={onKeyDown} onFocus={() => setFocused(true)} onBlur={() => { setFocused(false); if (phaseRef.current === 'play') setPhase('paused'); }}>
      <div className="game-hud">
        <span>Tasks <b>{hud.tasks}</b></span>
        <span>
          Context <b>{hud.ctx * K_PER_CELL}k</b> / {LIMIT * K_PER_CELL}k
          <span className={`game-meter ${hud.ctx / LIMIT > 0.75 ? 'hot' : ''}`}><span style={{ width: `${Math.min(100, (hud.ctx / LIMIT) * 100)}%` }} /></span>
        </span>
        <span className="game-hud-right">Best <b>{best}</b></span>
      </div>
      <div className="game-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
        <canvas ref={canvasRef} />
        {phase === 'ready' && (
          <div className="game-overlay">
            <div className="game-card">
              <h2>Token Muncher</h2>
              <p>You're a coding agent. Finish as many tasks as you can without blowing your 128k context window.</p>
              <ul className="game-legend">
                {Object.entries(ITEMS).map(([k, it]) => (
                  <li key={k}><span className="game-glyph" style={{ color: it.color, borderColor: it.color }}>{it.glyph}</span>{it.label}</li>
                ))}
              </ul>
              <p className="muted small">Arrow keys or WASD to steer, swipe on touch. <kbd>Space</kbd> pauses.</p>
              <button className="btn primary" onClick={start}>Start</button>
            </div>
          </div>
        )}
        {phase === 'paused' && (
          <div className="game-overlay">
            <div className="game-card">
              <h2>Paused</h2>
              <p className="muted small">The agent is waiting for your approval.</p>
              <button className="btn primary" onClick={togglePause}>Resume</button>
            </div>
          </div>
        )}
        {phase === 'over' && (
          <div className="game-overlay">
            <div className="game-card">
              <h2>{ENDINGS[ending]}</h2>
              <strong className="game-big">{hud.tasks} {hud.tasks === 1 ? 'task' : 'tasks'}</strong>
              <p className="muted small">Peak context {game.current.peak * K_PER_CELL}k · Best {best} tasks</p>
              <div className="btn-row center">
                <button className="btn primary" onClick={start}>Run again</button>
                <span className="muted small">or press <kbd>Space</kbd></span>
              </div>
            </div>
          </div>
        )}
        {!focused && phase === 'play' && <span className="game-hint">Click to focus</span>}
      </div>
    </div>
  );
}
