import { useEffect, useRef, useState } from 'react';
import { storage } from '../os.js';
import useGameCanvas, { mix, MONO } from './useGameCanvas.js';

const TARGET = 10000; // ft
const CEILING = 12000; // top of the altimeter
const G = 32.2; // ft/s²
const BASE_THRUST = 3 * G; // ft/s² while the motor burns
const FUEL = 14; // seconds of burn: enough to reach the target, not enough to waste
const TIME_SCALE = 3; // sim seconds per real second, so a flight takes ~10s
const SUBSTEP = 1 / 240;
const FT_ON_SCREEN = 2400;
const GROUND = 36; // px

const STARS = Array.from({ length: 160 }, () => ({ x: Math.random(), ft: 2500 + Math.random() * 13000, r: Math.random() * 1.2 + 0.4 }));

// Each launch gets a slightly different motor, so you can't just memorise the timing.
function newFlight() {
  const variance = Math.round((Math.random() * 12 - 6) * 10) / 10;
  return { h: 0, v: 0, fuel: FUEL, burning: false, launched: false, variance, thrust: BASE_THRUST * (1 + variance / 100), maxH: 0, smoke: [] };
}

// Advances the flight by dt sim seconds; returns true at the moment it reaches apogee.
function step(s, dt) {
  const burning = s.burning && s.fuel > 0;
  if (burning) s.fuel = Math.max(0, s.fuel - dt);
  const v0 = s.v;
  s.v += ((burning ? s.thrust : 0) - G) * dt;
  s.h += s.v * dt;
  if (s.h <= 0) { s.h = 0; s.v = Math.max(0, s.v); }
  s.maxH = Math.max(s.maxH, s.h);
  return v0 > 0 && s.v <= 0 && s.h > 0;
}

function verdict(apogee) {
  const err = Math.abs(apogee - TARGET);
  if (err <= 50) return 'Bullseye. Are you secretly a flight computer?';
  if (err <= 250) return 'Competition-grade apogee. The judges are impressed.';
  if (err <= 1000) return 'Respectable flight. Close enough to brag about.';
  return apogee > TARGET ? 'Way over. Range safety would like a word.' : 'Under-cooked. Burn a little longer next time.';
}

const fmt = (n) => Math.round(n).toLocaleString('en-US');
const signed = (n) => `${n >= 0 ? '+' : '−'}${fmt(Math.abs(n))}`;

function drawRocket(ctx, x, base, flame) {
  if (flame) {
    const len = 20 + Math.random() * 16;
    ctx.fillStyle = '#ff9a3c';
    ctx.beginPath(); ctx.moveTo(x - 5, base); ctx.lineTo(x + 5, base); ctx.lineTo(x, base + len); ctx.fill();
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath(); ctx.moveTo(x - 3, base); ctx.lineTo(x + 3, base); ctx.lineTo(x, base + len * 0.55); ctx.fill();
  }
  ctx.fillStyle = '#7c9cff';
  ctx.beginPath(); ctx.moveTo(x - 5, base); ctx.lineTo(x - 5, base - 13); ctx.lineTo(x - 12, base + 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(x + 5, base); ctx.lineTo(x + 5, base - 13); ctx.lineTo(x + 12, base + 2); ctx.fill();
  ctx.fillStyle = '#e8eaf0';
  ctx.fillRect(x - 5, base - 40, 10, 40);
  ctx.fillStyle = '#7c9cff';
  ctx.fillRect(x - 5, base - 27, 10, 3);
  ctx.fillStyle = '#ff4d6d';
  ctx.beginPath(); ctx.moveTo(x - 5, base - 40); ctx.lineTo(x + 5, base - 40); ctx.lineTo(x, base - 56); ctx.fill();
}

export default function Apogee() {
  const sim = useRef(newFlight());
  const phaseRef = useRef('ready');
  const [phase, setPhaseState] = useState('ready'); // ready | flight | done
  const [result, setResult] = useState(null);
  const [best, setBest] = useState(() => storage.get('pos.apogee.best', null));
  const [focused, setFocused] = useState(false);
  const wrap = useRef(null);

  const setPhase = (p) => { phaseRef.current = p; setPhaseState(p); };
  useEffect(() => { wrap.current?.focus({ preventScroll: true }); }, []);

  const press = () => {
    const s = sim.current;
    if (phaseRef.current === 'done') return;
    if (s.fuel > 0) s.burning = true;
    if (!s.launched) { s.launched = true; setPhase('flight'); }
  };
  const release = () => { sim.current.burning = false; };
  const restart = () => {
    sim.current = newFlight();
    setResult(null);
    setPhase('ready');
    wrap.current?.focus({ preventScroll: true });
  };

  const land = (apogee) => {
    const err = Math.abs(apogee - TARGET);
    setPhase('done');
    setResult({ apogee, text: verdict(apogee) });
    setBest((b) => {
      const next = b === null || err < b ? err : b;
      storage.set('pos.apogee.best', next);
      return next;
    });
  };

  const canvasRef = useGameCanvas((ctx, w, h, dt) => {
    const s = sim.current;
    if (phaseRef.current === 'flight') {
      for (let t = dt * TIME_SCALE; t > 0; t -= SUBSTEP) {
        if (step(s, Math.min(SUBSTEP, t))) { land(s.maxH); break; }
      }
    }
    const flame = s.burning && s.fuel > 0 && phaseRef.current === 'flight';
    if (flame) for (let i = 0; i < 2; i++) s.smoke.push({ x: (Math.random() - 0.5) * 6, ft: s.h, vx: (Math.random() - 0.5) * 24, age: 0, r: 4 + Math.random() * 3 });
    s.smoke.forEach((p) => { p.age += dt; p.x += p.vx * dt; p.r += 10 * dt; });
    s.smoke = s.smoke.filter((p) => p.age < 2.5);

    const scale = h / FT_ON_SCREEN; // px per ft
    const camFt = Math.max(0, s.h - (h * 0.42) / scale);
    const y = (ft) => h - GROUND - (ft - camFt) * scale;
    const cx = w / 2;

    // Sky darkens toward space as you climb.
    const k = Math.min(1, s.h / CEILING);
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, mix([18, 32, 66], [3, 4, 12], k));
    sky.addColorStop(1, mix([52, 84, 134], [12, 16, 36], k));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#fff';
    for (const st of STARS) {
      const sy = y(st.ft);
      if (sy < 0 || sy > h) continue;
      ctx.globalAlpha = Math.min(1, (st.ft - 2500) / 4000) * 0.8;
      ctx.fillRect(st.x * w, sy, st.r, st.r);
    }
    ctx.globalAlpha = 1;

    // Altitude grid every 1,000 ft.
    ctx.font = `11px ${MONO}`;
    ctx.textBaseline = 'middle';
    for (let ft = Math.max(1000, Math.ceil(camFt / 1000) * 1000); ft < camFt + FT_ON_SCREEN + 1000; ft += 1000) {
      const sy = y(ft);
      if (ft === TARGET) continue;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(0, sy, w, 1);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.textAlign = 'left';
      ctx.fillText(`${fmt(ft)} ft`, 10, sy - 8);
    }
    const ty = y(TARGET);
    if (ty > -20 && ty < h) {
      ctx.strokeStyle = '#5eead4';
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, ty); ctx.lineTo(w, ty); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#5eead4';
      ctx.textAlign = 'left';
      ctx.fillText('TARGET · 10,000 ft', 10, ty - 9);
    }

    // Ground and launch rail.
    const gy = y(0);
    if (gy < h) {
      ctx.fillStyle = '#0b0f17';
      ctx.fillRect(0, gy, w, h - gy);
      ctx.fillStyle = '#2a3142';
      ctx.fillRect(cx + 14, gy - 70, 3, 70);
      ctx.fillRect(cx - 30, gy, 60, 3);
    }

    for (const p of s.smoke) {
      ctx.globalAlpha = (1 - p.age / 2.5) * 0.35;
      ctx.fillStyle = '#cfd6e6';
      ctx.beginPath(); ctx.arc(cx + p.x, y(p.ft) + 6, p.r, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    drawRocket(ctx, cx, y(s.h), flame);

    // Readouts.
    ctx.textAlign = 'left';
    ctx.font = `12px ${MONO}`;
    ctx.fillStyle = 'rgba(5,6,12,0.55)';
    ctx.fillRect(8, 8, 172, 82);
    ctx.fillStyle = '#e8eaf0';
    ctx.fillText(`ALT   ${fmt(s.h)} ft`, 16, 22);
    ctx.fillText(`VEL   ${signed(s.v)} ft/s`, 16, 40);
    ctx.fillText('FUEL', 16, 58);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(58, 53, 112, 9);
    ctx.fillStyle = s.fuel / FUEL < 0.2 ? '#f87171' : '#ff9a3c';
    ctx.fillRect(58, 53, 112 * (s.fuel / FUEL), 9);
    ctx.fillStyle = '#9aa3b5';
    ctx.fillText(`MOTOR ${s.variance >= 0 ? '+' : ''}${s.variance}% thrust`, 16, 76);

    // Altimeter: the whole flight at a glance.
    const top = 16;
    const bottom = h - GROUND - 10;
    const ay = (ft) => bottom - (Math.min(ft, CEILING) / CEILING) * (bottom - top);
    const ax = w - 26;
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(ax, top, 6, bottom - top);
    ctx.fillStyle = '#5eead4';
    ctx.fillRect(ax - 5, ay(TARGET) - 1, 16, 2);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fillRect(ax - 3, ay(s.maxH), 12, 1);
    ctx.fillStyle = '#7c9cff';
    ctx.beginPath(); ctx.moveTo(ax - 2, ay(s.h)); ctx.lineTo(ax - 10, ay(s.h) - 5); ctx.lineTo(ax - 10, ay(s.h) + 5); ctx.fill();
  });

  const onKeyDown = (e) => {
    if (![' ', 'ArrowUp', 'Enter', 'r', 'R'].includes(e.key)) return;
    e.preventDefault();
    if (e.repeat) return;
    if (phaseRef.current === 'done') restart();
    else if (e.key === ' ' || e.key === 'ArrowUp') press();
  };
  const onKeyUp = (e) => { if (e.key === ' ' || e.key === 'ArrowUp') release(); };
  const onPointerDown = (e) => {
    if (e.target.closest('button')) return;
    wrap.current?.focus({ preventScroll: true });
    press();
  };

  const err = result && result.apogee - TARGET;
  return (
    <div
      ref={wrap}
      className="game"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onFocus={() => setFocused(true)}
      onBlur={() => { setFocused(false); release(); }}
    >
      <div className="game-stage" onPointerDown={onPointerDown} onPointerUp={release} onPointerCancel={release} onPointerLeave={release}>
        <canvas ref={canvasRef} />
        {phase === 'ready' && (
          <div className="game-overlay">
            <div className="game-card">
              <h2>Apogee</h2>
              <p>Hold <kbd>Space</kbd> (or press and hold) to burn. Let go to coast, and press again to re-light while fuel lasts.</p>
              <p>Peak as close to <b>10,000 ft</b> as you can.</p>
              <p className="muted small">
                Today's motor: {sim.current.variance >= 0 ? '+' : ''}{sim.current.variance}% thrust
                {best !== null && <> · Best: {fmt(best)} ft off</>}
              </p>
            </div>
          </div>
        )}
        {phase === 'done' && result && (
          <div className="game-overlay">
            <div className="game-card">
              <span className="muted small">APOGEE</span>
              <strong className="game-big">{fmt(result.apogee)} ft</strong>
              <p className="small">{signed(err)} ft from target</p>
              <p>{result.text}</p>
              <p className="muted small">Best: {fmt(best)} ft off. In real life, STES Rocketry placed 16th in the 10,000 ft COTS category at Spaceport America Cup 2021.</p>
              <div className="btn-row center">
                <button className="btn primary" onClick={restart}>Launch again</button>
                <span className="muted small">or press <kbd>Space</kbd></span>
              </div>
            </div>
          </div>
        )}
        {!focused && phase !== 'done' && <span className="game-hint">Click to focus</span>}
      </div>
    </div>
  );
}
