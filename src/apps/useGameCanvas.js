import { useEffect, useRef } from 'react';

// Sizes a canvas to its parent (sharp on retina screens) and calls draw(ctx, w, h, dt) every frame.
// The latest `draw` is always used, so it can read fresh state without restarting the loop.
export default function useGameCanvas(draw) {
  const ref = useRef(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let raf;
    let last = performance.now();

    const resize = () => {
      const r = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    resize();

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05); // clamp so a background tab doesn't teleport things
      last = now;
      if (w && h) drawRef.current(ctx, w, h, dt);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return ref;
}

// Blend two [r, g, b] colours; t = 0 gives a, t = 1 gives b.
export const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;

export const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
