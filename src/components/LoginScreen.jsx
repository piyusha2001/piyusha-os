import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import profile from '../data/profile.json';

export default function LoginScreen({ onLogin }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    const onKey = (e) => e.key === 'Enter' && onLogin();
    window.addEventListener('keydown', onKey);
    return () => { clearInterval(t); window.removeEventListener('keydown', onKey); };
  }, [onLogin]);

  return (
    <div className="login">
      <div className="login-clock">
        <div className="time">{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="date">{now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      </div>
      <div className="login-card">
        <img className="login-avatar" src={profile.avatar} alt={profile.name} />
        <div className="login-name">{profile.name}</div>
        <div className="login-sub">{profile.location}</div>
        <button className="login-btn" onClick={onLogin} autoFocus>
          <span>Enter as guest</span>
          <ArrowRight size={16} />
        </button>
        <div className="login-hint">press Enter ↵</div>
      </div>
    </div>
  );
}
