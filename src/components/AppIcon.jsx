import { APPS } from '../apps/registry.js';

export default function AppIcon({ appId, size = 48 }) {
  const app = APPS[appId];
  const Icon = app.icon;
  return (
    <span
      className="app-icon"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.26,
        background: `linear-gradient(145deg, ${app.color[0]}, ${app.color[1]})`,
      }}
    >
      <Icon size={size * 0.52} strokeWidth={1.8} color="#fff" />
    </span>
  );
}
