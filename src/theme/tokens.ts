export interface Tokens {
  bg: {
    page: string;
    card: string;
    cardHover: string;
    cardSubtle: string;
    input: string;
    inputSubtle: string;
    overlay: string;
    muted: string;
    mutedStrong: string;
    icon: string;
  };
  border: {
    default: string;
    subtle: string;
    strong: string;
    input: string;
    focus: string;
    divider: string;
  };
  text: {
    primary: string;
    secondary: string;
    muted: string;
    subtle: string;
    disabled: string;
    onDark: string;
    link: string;
  };
  shadow: { card: string; cardLg: string; focus: string; drop: string };
  income: {
    bg: string;
    bgIcon: string;
    border: string;
    text: string;
    textAlt: string;
    shadow: string;
  };
  expense: {
    bg: string;
    bgIcon: string;
    border: string;
    text: string;
    textAlt: string;
    shadow: string;
  };
  balance: {
    bg: string;
    bgIcon: string;
    border: string;
    text: string;
    textAlt: string;
    shadow: string;
  };
  investment: {
    bg: string;
    bgIcon: string;
    border: string;
    text: string;
    textAlt: string;
    shadow: string;
  };
  warning: { bg: string; border: string; text: string };
  info: {
    bg: string;
    bgAlt: string;
    border: string;
    text: string;
    textAlt: string;
    shadow: string;
  };
  quickInput: {
    bg: string;
    border: string;
    borderFocus: string;
    shadow: string;
    zapBg: string;
    zapBgFocus: string;
    dropBg: string;
    dropBorder: string;
    dropShadow: string;
  };
}

export const LIGHT: Tokens = {
  bg: {
    page: '#f1f5f9',
    card: '#ffffff',
    cardHover: '#f8fafc',
    cardSubtle: 'rgba(248,250,252,0.8)',
    input: '#ffffff',
    inputSubtle: '#f8fafc',
    overlay: 'rgba(255,255,255,0.8)',
    muted: '#f1f5f9',
    mutedStrong: '#e2e8f0',
    icon: '#f8fafc',
  },

  border: {
    default: 'rgba(0,0,0,0.06)',
    subtle: 'rgba(0,0,0,0.04)',
    strong: 'rgba(0,0,0,0.10)',
    input: '#e2e8f0',
    focus: '#6366f1',
    divider: 'rgba(0,0,0,0.04)',
  },

  text: {
    primary: '#0f172a',
    secondary: '#334155',
    muted: '#64748b',
    subtle: '#94a3b8',
    disabled: '#cbd5e1',
    onDark: '#ffffff',
    link: '#6366f1',
  },

  shadow: {
    card: '0 8px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
    cardLg: '0 10px 40px rgba(99,102,241,0.10), 0 2px 8px rgba(0,0,0,0.06)',
    focus: '0 0 0 3px rgba(99,102,241,0.15)',
    drop: '0 20px 60px rgba(0,0,0,0.12)',
  },

  income: {
    bg: '#ecfdf5',
    bgIcon: '#a7f3d0',
    border: '#d1fae5',
    text: '#166534',
    textAlt: '#047857',
    shadow: 'rgba(16,185,129,0.08)',
  },

  expense: {
    bg: '#fef2f2',
    bgIcon: '#fda4af',
    border: '#fecdd3',
    text: '#991b1b',
    textAlt: '#be123c',
    shadow: 'rgba(244,63,94,0.08)',
  },

  balance: {
    bg: '#ffffff',
    bgIcon: '#f1f5f9',
    border: '#e2e8f0',
    text: '#1e293b',
    textAlt: '#334155',
    shadow: 'rgba(0,0,0,0.06)',
  },

  investment: {
    bg: '#eff6ff',
    bgIcon: '#bfdbfe',
    border: '#bfdbfe',
    text: '#1d4ed8',
    textAlt: '#1e40af',
    shadow: 'rgba(59,130,246,0.08)',
  },

  warning: {
    bg: '#fefce8',
    border: '#fde68a',
    text: '#92400e',
  },

  info: {
    bg: '#eef2ff',
    bgAlt: '#e0e7ff',
    border: '#c7d2fe',
    text: '#3730a3',
    textAlt: '#4338ca',
    shadow: 'rgba(99,102,241,0.08)',
  },

  quickInput: {
    bg: '#ffffff',
    border: '#e2e8f0',
    borderFocus: '#6366f1',
    shadow: '0 0 0 3px rgba(99,102,241,0.15)',
    zapBg: '#1e293b',
    zapBgFocus: '#6366f1',
    dropBg: '#ffffff',
    dropBorder: 'rgba(0,0,0,0.06)',
    dropShadow: '0 20px 60px rgba(0,0,0,0.12)',
  },
} as const;

export const DARK: Tokens = {
  bg: {
    page: '#020617',
    card: '#0f172a',
    cardHover: 'rgba(255,255,255,0.03)',
    cardSubtle: 'rgba(255,255,255,0.04)',
    input: 'rgba(255,255,255,0.06)',
    inputSubtle: 'rgba(255,255,255,0.04)',
    overlay: 'rgba(255,255,255,0.06)',
    muted: 'rgba(255,255,255,0.06)',
    mutedStrong: 'rgba(255,255,255,0.10)',
    icon: 'rgba(255,255,255,0.06)',
  },

  border: {
    default: 'rgba(255,255,255,0.07)',
    subtle: 'rgba(255,255,255,0.04)',
    strong: 'rgba(255,255,255,0.12)',
    input: 'rgba(255,255,255,0.10)',
    focus: '#6366f1',
    divider: 'rgba(255,255,255,0.05)',
  },

  text: {
    primary: '#f1f5f9',
    secondary: '#cbd5e1',
    muted: '#94a3b8',
    subtle: '#64748b',
    disabled: '#475569',
    onDark: '#ffffff',
    link: '#a5b4fc',
  },

  shadow: {
    card: '0 4px 20px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)',
    cardLg: '0 10px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
    focus: '0 0 0 3px rgba(99,102,241,0.25)',
    drop: '0 20px 60px rgba(0,0,0,0.5)',
  },

  income: {
    bg: '#022c22',
    bgIcon: 'rgba(110,231,183,0.15)',
    border: 'rgba(110,231,183,0.15)',
    text: '#6ee7b7',
    textAlt: '#a7f3d0',
    shadow: 'rgba(74,222,128,0.08)',
  },

  expense: {
    bg: '#2a0b0b',
    bgIcon: 'rgba(252,165,165,0.15)',
    border: 'rgba(252,165,165,0.15)',
    text: '#fca5a5',
    textAlt: '#fecaca',
    shadow: 'rgba(248,113,113,0.08)',
  },

  balance: {
    bg: '#0f172a',
    bgIcon: 'rgba(255,255,255,0.07)',
    border: 'rgba(255,255,255,0.07)',
    text: '#f1f5f9',
    textAlt: '#e2e8f0',
    shadow: 'rgba(0,0,0,0.3)',
  },

  investment: {
    bg: '#0a1f44',
    bgIcon: 'rgba(147,197,253,0.15)',
    border: 'rgba(147,197,253,0.15)',
    text: '#93c5fd',
    textAlt: '#bfdbfe',
    shadow: 'rgba(96,165,250,0.08)',
  },

  warning: {
    bg: 'rgba(252,211,77,0.08)',
    border: 'rgba(252,211,77,0.20)',
    text: '#fcd34d',
  },

  info: {
    bg: 'rgba(99,102,241,0.12)',
    bgAlt: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.25)',
    text: '#a5b4fc',
    textAlt: '#818cf8',
    shadow: 'rgba(99,102,241,0.15)',
  },

  quickInput: {
    bg: '#0f172a',
    border: 'rgba(255,255,255,0.10)',
    borderFocus: '#6366f1',
    shadow: '0 0 0 3px rgba(99,102,241,0.20)',
    zapBg: 'rgba(255,255,255,0.08)',
    zapBgFocus: 'rgba(99,102,241,0.30)',
    dropBg: '#0f172a',
    dropBorder: 'rgba(255,255,255,0.08)',
    dropShadow: '0 20px 60px rgba(0,0,0,0.50)',
  },
};
