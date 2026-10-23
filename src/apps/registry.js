import {
  User, Briefcase, FolderGit2, BookOpen, Trophy, Cpu, TerminalSquare,
  FileText, Mail, Settings as SettingsIcon, Trash2, Rocket, Worm,
} from 'lucide-react';
import About from './About.jsx';
import Experience from './Experience.jsx';
import Projects from './Projects.jsx';
import Research from './Research.jsx';
import Achievements from './Achievements.jsx';
import Skills from './Skills.jsx';
import Terminal from './Terminal.jsx';
import Resume from './Resume.jsx';
import Contact from './Contact.jsx';
import Settings from './Settings.jsx';
import Trash from './Trash.jsx';
import Apogee from './Apogee.jsx';
import Muncher from './Muncher.jsx';

// Every app on PiyushaOS. `color` is the icon tile gradient; `size` is the default window size.
export const APPS = {
  about:        { title: 'About Me',     icon: User,           color: ['#7c5cff', '#4f8bff'], component: About,        size: [720, 520] },
  experience:   { title: 'Experience',   icon: Briefcase,      color: ['#ff8a4c', '#ff4d6d'], component: Experience,   size: [860, 560] },
  projects:     { title: 'Projects',     icon: FolderGit2,     color: ['#22c1a4', '#1f8fff'], component: Projects,     size: [900, 580] },
  research:     { title: 'Research',     icon: BookOpen,       color: ['#f7b733', '#fc4a1a'], component: Research,     size: [760, 520] },
  achievements: { title: 'Achievements', icon: Trophy,         color: ['#ffd452', '#f59e0b'], component: Achievements, size: [740, 540] },
  skills:       { title: 'Skills',       icon: Cpu,            color: ['#34d399', '#059669'], component: Skills,       size: [680, 480] },
  terminal:     { title: 'Terminal',     icon: TerminalSquare, color: ['#3a3f4b', '#14161b'], component: Terminal,     size: [720, 460] },
  resume:       { title: 'Resume.pdf',   icon: FileText,       color: ['#f87171', '#dc2626'], component: Resume,       size: [760, 640] },
  contact:      { title: 'Contact',      icon: Mail,           color: ['#60a5fa', '#2563eb'], component: Contact,      size: [560, 520] },
  settings:     { title: 'Settings',     icon: SettingsIcon,   color: ['#9ca3af', '#4b5563'], component: Settings,     size: [560, 440] },
  trash:        { title: 'Trash',        icon: Trash2,         color: ['#6b7280', '#374151'], component: Trash,        size: [520, 380] },
  apogee:       { title: 'Apogee',       icon: Rocket,         color: ['#38bdf8', '#6366f1'], component: Apogee,       size: [520, 620] },
  muncher:      { title: 'Token Muncher', icon: Worm,          color: ['#f472b6', '#9333ea'], component: Muncher,      size: [680, 540] },
};

export const DESKTOP_APPS = ['about', 'experience', 'projects', 'research', 'achievements', 'skills', 'resume', 'terminal', 'apogee', 'muncher'];
export const DOCK_APPS = ['about', 'experience', 'projects', 'research', 'achievements', 'skills', 'terminal', 'resume', 'contact', 'settings', 'trash'];
