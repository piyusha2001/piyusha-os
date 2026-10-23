import { useEffect, useRef, useState } from 'react';
import profile from '../data/profile.json';
import { useOS, WALLPAPERS } from '../os.js';
import { APPS } from './registry.js';

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const HOME = '/home/guest';

// ---------- virtual filesystem, generated from profile.json ----------
function buildFS() {
  const md = (lines) => lines.filter((l) => l !== null).join('\n');
  const exp = Object.fromEntries(
    profile.experience.map((e) => [
      `${e.id}.md`,
      md([`# ${e.role}`, `${e.org} · ${e.location}`, e.period, '', ...e.points.map((p) => `• ${p}`), '', e.link ? `→ ${e.link}` : null]),
    ])
  );
  const proj = Object.fromEntries(
    profile.projects.map((p) => [
      `${slug(p.name)}.md`,
      md([`# ${p.name}: ${p.subtitle}`, `stack: ${p.stack.join(', ')}`, '', ...p.points.map((x) => `• ${x}`), '',
        p.repo ? `repo → ${p.repo}` : null, p.demo ? `demo → ${p.demo}` : null]),
    ])
  );
  const papers = Object.fromEntries(
    profile.publications.map((p, i) => [`paper-${i + 1}.txt`, md([p.title, p.authors, `${p.venue} (${p.year}) · ${p.status}`, `→ ${p.link}`])])
  );
  return {
    'about.txt': md([profile.name, profile.title, '', ...profile.bio]),
    'contact.txt': md([`email     ${profile.contact.email}`, `github    ${profile.contact.github}`, `linkedin  ${profile.contact.linkedin}`, `links     ${profile.contact.bio}`]),
    'skills.txt': Object.entries(profile.skills).map(([k, v]) => `${k}:\n  ${v.join(', ')}`).join('\n\n'),
    'resume.pdf': null,
    '.secrets': 'I genuinely enjoy reading eval logs. Also: kanelbullar > everything.',
    experience: exp,
    projects: proj,
    research: papers,
  };
}

const FS = buildFS();

function resolve(cwd, path = '') {
  if (!path || path === '~') return HOME;
  let parts = path.startsWith('/') ? [] : cwd.split('/').filter(Boolean);
  if (path.startsWith('~')) { parts = HOME.split('/').filter(Boolean); path = path.slice(1); }
  for (const seg of path.split('/').filter(Boolean)) {
    if (seg === '..') parts.pop();
    else if (seg !== '.') parts.push(seg);
  }
  return '/' + parts.join('/');
}

function lookup(abs) {
  if (abs === HOME) return FS;
  if (!abs.startsWith(HOME + '/')) return undefined;
  let node = FS;
  for (const seg of abs.slice(HOME.length + 1).split('/')) {
    if (node === null || typeof node !== 'object' || !(seg in node)) return undefined;
    node = node[seg];
  }
  return node;
}

const isDir = (n) => n !== null && typeof n === 'object';
const pretty = (abs) => (abs.startsWith(HOME) ? '~' + abs.slice(HOME.length) : abs);

const COMMANDS = {
  help: 'show this help',
  whoami: 'who is Piyusha?',
  neofetch: 'system info, but make it a portfolio',
  ls: 'list files   (ls -a for hidden)',
  cd: 'change directory',
  cat: 'print a file',
  tree: 'show the whole filesystem',
  open: 'open an app, e.g. open projects',
  experience: 'work history',
  projects: 'list projects',
  skills: 'tech stack',
  research: 'publications',
  contact: 'how to reach me',
  resume: 'open my CV',
  play: 'play a game: play apogee | play muncher',
  github: 'open GitHub in a new tab',
  linkedin: 'open LinkedIn in a new tab',
  email: 'compose an email',
  wallpaper: 'wallpaper <aurora|dusk|nebula|mono>',
  history: 'command history',
  clear: 'clear the screen',
  exit: 'close the terminal',
};

const BANNER = [
  { t: 'accent', v: '  ___ _              _          ___  ___ ' },
  { t: 'accent', v: ' | _ (_)_  _ _  _ __| |_  __ _ / _ \\/ __|' },
  { t: 'accent', v: ' |  _/ | || | || (_-< \' \\/ _` | (_) \\__ \\' },
  { t: 'accent', v: ' |_| |_|\\_, |\\_,_/__/_||_\\__,_|\\___/|___/' },
  { t: 'accent', v: '         |__/                             ' },
  { t: 'dim', v: '' },
  { t: 'out', v: `Welcome, guest. Type 'help' to see what I can do.` },
  { t: 'dim', v: `Tip: Tab autocompletes, ↑/↓ browse history.` },
  { t: 'out', v: '' },
];

export default function Terminal() {
  const os = useOS();
  const [lines, setLines] = useState(BANNER);
  const [input, setInput] = useState('');
  const [cwd, setCwd] = useState(HOME);
  const [history, setHistory] = useState([]);
  const [hIdx, setHIdx] = useState(-1);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [lines]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const prompt = (dir = cwd) => `guest@piyusha-os:${pretty(dir)}$`;

  // Runs one command against `dir`; returns the printed lines and the resulting cwd.
  const run = (raw, dir) => {
    const cwd = dir;
    const out = [{ t: 'cmd', v: raw, p: prompt(dir) }];
    const print = (v, t = 'out') => out.push({ t, v });
    const link = (label, href) => out.push({ t: 'link', v: label, href });
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const arg = args.join(' ');
    let nextCwd = cwd;

    switch (cmd) {
      case '':
        break;
      case 'help':
        print('Available commands:', 'accent');
        Object.entries(COMMANDS).forEach(([k, v]) => print(`  ${k.padEnd(12)} ${v}`));
        print('');
        print('Try: cat about.txt · cd projects && ls · open experience', 'dim');
        break;
      case 'whoami':
        print(profile.name, 'accent');
        print(profile.title);
        print('');
        profile.bio.forEach((b) => print(b));
        break;
      case 'neofetch': {
        const info = [
          ['OS', 'PiyushaOS 26.10 (Stockholm)'],
          ['Host', 'KTH Royal Institute of Technology'],
          ['Kernel', 'MSc Computer Science, 2026–2028'],
          ['Uptime', `${new Date().getFullYear() - 2001} years`],
          ['Shell', 'curiosity --verbose'],
          ['Research', 'LLM agents · token efficiency'],
          ['Prev', 'Protex AI (YC S21) · IISc Bangalore'],
          ['Papers', `${profile.publications.length} (1 × Best Paper 🏆)`],
          ['Languages', profile.skills.Languages.join(', ')],
          ['Location', profile.location],
        ];
        const art = ['    .-""-.   ', '   /  ◐   \\  ', '  |  .--.  | ', '  |  (  )  | ', '   \\  `--` / ', "    '-..-'   ", '             ', '             ', '             ', '             '];
        info.forEach(([k, v], i) => out.push({ t: 'neo', art: art[i], k, v }));
        out.push({ t: 'swatch' });
        break;
      }
      case 'ls': {
        const showAll = args.includes('-a') || args.includes('-la');
        const target = args.filter((a) => !a.startsWith('-'))[0];
        const node = lookup(resolve(cwd, target));
        if (node === undefined) print(`ls: ${target}: No such file or directory`, 'err');
        else if (!isDir(node)) print(target);
        else {
          const names = Object.keys(node).filter((n) => showAll || !n.startsWith('.'));
          out.push({ t: 'ls', items: names.map((n) => ({ n, dir: isDir(node[n]) })) });
        }
        break;
      }
      case 'cd': {
        const abs = resolve(cwd, arg);
        const node = lookup(abs);
        if (!isDir(node)) print(`cd: ${arg}: ${node === undefined ? 'No such file or directory' : 'Not a directory'}`, 'err');
        else nextCwd = abs;
        break;
      }
      case 'pwd':
        print(cwd);
        break;
      case 'cat': {
        if (!arg) { print('usage: cat <file>', 'err'); break; }
        const node = lookup(resolve(cwd, arg));
        if (node === undefined) print(`cat: ${arg}: No such file or directory`, 'err');
        else if (isDir(node)) print(`cat: ${arg}: Is a directory`, 'err');
        else if (node === null) { print('cat: resume.pdf: binary file, opening in viewer instead…', 'dim'); os.openApp('resume'); }
        else node.split('\n').forEach((l) => (l.startsWith('# ') ? print(l.slice(2), 'accent') : l.includes('→ http') ? link(l, l.split('→ ')[1]) : print(l)));
        break;
      }
      case 'tree': {
        const walk = (node, prefix) => {
          const keys = Object.keys(node).filter((k) => !k.startsWith('.'));
          keys.forEach((k, i) => {
            const last = i === keys.length - 1;
            print(`${prefix}${last ? '└── ' : '├── '}${k}${isDir(node[k]) ? '/' : ''}`, isDir(node[k]) ? 'accent' : 'out');
            if (isDir(node[k])) walk(node[k], prefix + (last ? '    ' : '│   '));
          });
        };
        print('~', 'accent');
        walk(FS, '');
        break;
      }
      case 'open': {
        const id = Object.keys(APPS).find((k) => k === arg.toLowerCase() || APPS[k].title.toLowerCase() === arg.toLowerCase());
        if (id) { os.openApp(id); print(`Opening ${APPS[id].title}…`, 'dim'); }
        else print(`open: unknown app '${arg}'. Apps: ${Object.keys(APPS).join(', ')}`, 'err');
        break;
      }
      case 'play': {
        const game = { apogee: 'apogee', rocket: 'apogee', muncher: 'muncher', snake: 'muncher', tokens: 'muncher' }[arg.toLowerCase()];
        if (game) { os.openApp(game); print(`Launching ${APPS[game].title}…`, 'dim'); }
        else {
          print('usage: play <game>', 'err');
          print('  apogee    hit exactly 10,000 ft with a solid rocket motor');
          print('  muncher   finish tasks without blowing your context window');
        }
        break;
      }
      case 'experience':
        profile.experience.forEach((e) => {
          print(`${e.role}`, 'accent');
          print(`  ${e.org} · ${e.period}`);
        });
        print('');
        print("cat experience/<file>.md for details, or 'open experience'", 'dim');
        break;
      case 'projects':
        profile.projects.forEach((p) => print(`  ${(p.featured ? '★ ' : '  ') + p.name.padEnd(32)} ${p.stack.slice(0, 3).join(', ')}`));
        print('');
        print("cd projects && cat <name>.md, or 'open projects'", 'dim');
        break;
      case 'skills':
        Object.entries(profile.skills).forEach(([k, v]) => { print(k, 'accent'); print(`  ${v.join(' · ')}`); });
        break;
      case 'research':
        profile.publications.forEach((p, i) => { print(`[${i + 1}] ${p.title}`, 'accent'); print(`    ${p.venue} · ${p.status}`); });
        break;
      case 'contact':
        print(`email     ${profile.contact.email}`);
        link(`github    ${profile.contact.github}`, profile.contact.github);
        link(`linkedin  ${profile.contact.linkedin}`, profile.contact.linkedin);
        break;
      case 'resume':
        os.openApp('resume');
        print('Opening Resume.pdf…', 'dim');
        break;
      case 'github':
      case 'linkedin':
        window.open(profile.contact[cmd], '_blank', 'noopener');
        print(`Opening ${profile.contact[cmd]}`, 'dim');
        break;
      case 'email':
      case 'mail':
        os.openApp('contact');
        print('Opening Contact…', 'dim');
        break;
      case 'wallpaper':
        if (WALLPAPERS[arg]) { os.setWallpaper(arg); print(`Wallpaper set to ${WALLPAPERS[arg].name}.`, 'dim'); }
        else print(`usage: wallpaper <${Object.keys(WALLPAPERS).join('|')}>`, 'err');
        break;
      case 'history':
        history.forEach((h, i) => print(`  ${String(i + 1).padStart(3)}  ${h}`));
        break;
      case 'echo':
        print(arg);
        break;
      case 'date':
        print(new Date().toString());
        break;
      case 'clear':
        return { out: [], cwd: nextCwd, clear: true };
      case 'exit':
        os.closeWindow(os.windows.find((w) => w.appId === 'terminal')?.id);
        break;
      case 'sudo':
        if (arg === 'hire piyusha' || arg === 'hire-me') print('✔ Permission granted. Excellent decision. → ' + profile.contact.email, 'accent');
        else print(`guest is not in the sudoers file. This incident will be reported. (try: sudo hire piyusha)`, 'err');
        break;
      case 'rm':
        print(args.includes('-rf') ? 'Nice try. My research data is backed up in three places. 😌' : 'rm: permission denied', 'err');
        break;
      case 'fika':
        print('☕ + 🥐  Taking a fika break… back in 15 minutes. (Very Swedish of you.)', 'accent');
        break;
      case 'hello':
      case 'hi':
      case 'hej':
        print('Hej hej! 👋 Type help to look around.');
        break;
      case 'vim':
      case 'nano':
      case 'emacs':
        print(`${cmd}: let's not start that debate here. Try 'cat' instead.`, 'dim');
        break;
      default:
        print(`command not found: ${cmd}. Type 'help' for a list.`, 'err');
    }

    return { out, cwd: nextCwd };
  };

  // Supports simple `a && b` chains; each command sees the cwd left by the previous one.
  const submit = (raw) => {
    if (raw.trim()) setHistory((h) => [...h, raw]);
    setHIdx(-1);
    let dir = cwd;
    let buffer = lines;
    for (const part of raw.split('&&').map((s) => s.trim())) {
      const res = run(part, dir);
      buffer = res.clear ? [] : [...buffer, ...res.out];
      dir = res.cwd;
    }
    setLines(buffer);
    setCwd(dir);
  };

  const complete = () => {
    const tokens = input.split(' ');
    const last = tokens[tokens.length - 1];
    let candidates;
    if (tokens.length === 1) candidates = Object.keys(COMMANDS);
    else if (tokens[0] === 'open') candidates = Object.keys(APPS);
    else if (tokens[0] === 'wallpaper') candidates = Object.keys(WALLPAPERS);
    else {
      const slash = last.lastIndexOf('/');
      const base = slash >= 0 ? last.slice(0, slash + 1) : '';
      const node = lookup(resolve(cwd, base || '.'));
      candidates = isDir(node) ? Object.keys(node).map((k) => base + k + (isDir(node[k]) ? '/' : '')) : [];
    }
    const matches = candidates.filter((c) => c.startsWith(last));
    if (matches.length === 1) {
      tokens[tokens.length - 1] = matches[0];
      setInput(tokens.join(' ') + (matches[0].endsWith('/') ? '' : ' '));
    } else if (matches.length > 1) {
      setLines((ls) => [...ls, { t: 'cmd', v: input, p: prompt() }, { t: 'dim', v: matches.join('   ') }]);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') { submit(input); setInput(''); }
    else if (e.key === 'Tab') { e.preventDefault(); complete(); }
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const i = hIdx === -1 ? history.length - 1 : Math.max(0, hIdx - 1);
      setHIdx(i); setInput(history[i]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (hIdx === -1) return;
      const i = hIdx + 1;
      if (i >= history.length) { setHIdx(-1); setInput(''); } else { setHIdx(i); setInput(history[i]); }
    } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); setLines([]); }
    else if (e.key === 'c' && e.ctrlKey) { setLines((ls) => [...ls, { t: 'cmd', v: input + '^C', p: prompt() }]); setInput(''); }
  };

  return (
    <div className="terminal" onClick={() => window.getSelection()?.toString() || inputRef.current?.focus()}>
      {lines.map((l, i) => {
        if (l.t === 'cmd') return <div key={i}><span className="t-prompt">{l.p}</span> {l.v}</div>;
        if (l.t === 'link') return <div key={i}><a className="t-link" href={l.href} target="_blank" rel="noreferrer">{l.v}</a></div>;
        if (l.t === 'ls') return (
          <div key={i} className="t-ls">{l.items.map((it) => <span key={it.n} className={it.dir ? 't-accent' : ''}>{it.n}{it.dir ? '/' : ''}</span>)}</div>
        );
        if (l.t === 'neo') return <div key={i}><span className="t-accent">{l.art}</span> <span className="t-accent">{l.k}</span>: {l.v}</div>;
        if (l.t === 'swatch') return (
          <div key={i} className="t-swatch">{' '.repeat(14)}{['#ff5f57', '#febc2e', '#28c840', '#4f8bff', '#7c5cff', '#22c1a4', '#e5e7eb'].map((c) => <span key={c} style={{ background: c }} />)}</div>
        );
        return <div key={i} className={`t-${l.t}`}>{l.v || ' '}</div>;
      })}
      <div className="t-input-row" ref={endRef}>
        <span className="t-prompt">{prompt()}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Terminal input"
        />
      </div>
    </div>
  );
}
