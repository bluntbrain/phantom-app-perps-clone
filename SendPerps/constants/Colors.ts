export const colors = {
  background: {
    primary: '#1f1f1f',
    secondary: '#2b2b2b',
    tertiary: '#2a2a2a',
    card: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: '#a0a0a0',
    tertiary: '#666666',
    accent: '#a399e3',
    black: '#000000',
  },
  accent: {
    purple: '#a399e3',
    green: '#10b981',
    red: '#ef4444',
    orange: '#f59e0b',
    blue: '#3b82f6',
    yellow: '#eab308',
  },
  border: {
    primary: '#333333',
    secondary: '#444444',
  },
  ranking: {
    first: '#ffd700',
    second: '#c0c0c0',
    third: '#cd7f32',
  },
  crypto: {
    ethereum: '#627eea',
    bitcoin: '#f7931a',
    solana: '#14f195',
    polygon: '#8247e5',
    ripple: '#23292f',
    others: '#a0a0a0',
  },
} as const;

export type ColorsType = typeof colors;