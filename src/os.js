import { createContext, useContext } from 'react';

export const OSContext = createContext(null);
export const useOS = () => useContext(OSContext);

export const WALLPAPERS = {
  aurora: { name: 'Stockholm Aurora', className: 'wp-aurora' },
  dusk: { name: 'Baltic Dusk', className: 'wp-dusk' },
  nebula: { name: 'Nebula', className: 'wp-nebula' },
  mono: { name: 'Graphite', className: 'wp-mono' },
};

export const storage = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable; fine, it's just a preference */
    }
  },
};
