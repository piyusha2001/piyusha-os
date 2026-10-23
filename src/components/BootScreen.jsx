import { useEffect, useState } from 'react';

const LINES = [
  '[    0.000000] PiyushaOS kernel 26.10-kth (ppatil@stockholm) #1 SMP',
  '[    0.004211] Command line: BOOT_IMAGE=/vmlinuz root=/dev/brain quiet curious',
  '[    0.112834] Memory: 2019–2023 B.E. Computer Engineering ... CGPA 9.51 ✓',
  '[    0.231907] Mounting /experience/protex-ai (YC S21) ... ok',
  '[    0.318442] Mounting /experience/iisc-bangalore ... ok',
  '[    0.402116] Loading module llm_hallucination_detection ... ok',
  '[    0.488000] Loading module transformer_from_scratch ... ok',
  '[    0.561377] Starting superlean-agentd (token budget: -50%) ... ok',
  '[    0.640012] Connecting to KTH ASSERT research group ... ok',
  '[    0.702551] Locating fika ... ☕ found',
  '[    0.788190] Starting desktop environment ...',
];

export default function BootScreen({ onDone }) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (n >= LINES.length) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN(n + 1), 110 + Math.random() * 120);
    return () => clearTimeout(t);
  }, [n, onDone]);

  useEffect(() => {
    const skip = () => onDone();
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, [onDone]);

  return (
    <div className="boot" onClick={onDone}>
      <div className="boot-logo">
        <span className="logo-mark">◐</span> PiyushaOS
      </div>
      <pre className="boot-log">
        {LINES.slice(0, n).map((l) => (
          <div key={l}>{l}</div>
        ))}
        <span className="cursor">▋</span>
      </pre>
      <div className="boot-bar"><span style={{ width: `${(n / LINES.length) * 100}%` }} /></div>
      <div className="boot-hint">click or press any key to skip</div>
    </div>
  );
}
