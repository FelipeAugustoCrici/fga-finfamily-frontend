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
  extra: {
    bg: string;
    bgIcon: string;
    border: string;
    text: string;
    textAlt: string;
    shadow: string;
  };
  receipt: {
    paper: string;
    ink: string;
    sub: string;
    line: string;
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
    page: '#f6f4ef',
    card: '#ffffff',
    cardHover: '#f8f7f2',
    cardSubtle: 'rgba(255,255,255,0.8)',
    input: '#ffffff',
    inputSubtle: '#f8f7f2',
    overlay: 'rgba(255,255,255,0.8)',
    muted: '#f6f4ef',
    mutedStrong: '#e4e0d6',
    icon: '#f8f7f2',
  },

  border: {
    default: '#e4e0d6',
    subtle: 'rgba(28,43,45,0.05)',
    strong: 'rgba(28,43,45,0.12)',
    input: '#e4e0d6',
    focus: '#1c2b2d',
    divider: '#e4e0d6',
  },

  text: {
    primary: '#1c2b2d',
    secondary: '#3d4d4f',
    muted: '#5c6b6b',
    subtle: '#8a9391',
    disabled: '#c7c2b5',
    onDark: '#ffffff',
    link: '#2f6f4f',
  },

  shadow: {
    card: '0 1px 2px rgba(28,43,45,0.04), 0 8px 24px rgba(28,43,45,0.06)',
    cardLg: '0 10px 40px rgba(28,43,45,0.10), 0 2px 8px rgba(28,43,45,0.06)',
    focus: '0 0 0 3px rgba(47,111,79,0.15)',
    drop: '0 20px 60px rgba(28,43,45,0.12)',
  },

  income: {
    bg: '#e7f0e9',
    bgIcon: '#bcd7c6',
    border: '#d3e6d9',
    text: '#235940',
    textAlt: '#2f6f4f',
    shadow: 'rgba(47,111,79,0.08)',
  },

  expense: {
    bg: '#f7e9e5',
    bgIcon: '#e3b6a8',
    border: '#f0d4cc',
    text: '#a84a37',
    textAlt: '#c65b45',
    shadow: 'rgba(198,91,69,0.08)',
  },

  balance: {
    bg: '#ffffff',
    bgIcon: '#f0eee4',
    border: '#e4e0d6',
    text: '#1c2b2d',
    textAlt: '#3d4d4f',
    shadow: 'rgba(28,43,45,0.06)',
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
    bg: '#f5eedc',
    border: '#e6d6a8',
    text: '#96762c',
  },

  info: {
    bg: '#eef2ff',
    bgAlt: '#e0e7ff',
    border: '#c7d2fe',
    text: '#3730a3',
    textAlt: '#4338ca',
    shadow: 'rgba(99,102,241,0.08)',
  },

  extra: {
    bg: '#f5eedc',
    bgIcon: '#e2cd8f',
    border: '#ecdfbe',
    text: '#96762c',
    textAlt: '#b8923a',
    shadow: 'rgba(184,146,58,0.08)',
  },

  receipt: {
    paper: '#fdfdf9',
    ink: '#2b2b28',
    sub: '#8a8a80',
    line: '#cfcfc2',
  },

  quickInput: {
    bg: '#ffffff',
    border: '#cddcd2',
    borderFocus: '#2f6f4f',
    shadow: '0 0 0 3px rgba(47,111,79,0.15)',
    zapBg: '#2f6f4f',
    zapBgFocus: '#2f6f4f',
    dropBg: '#ffffff',
    dropBorder: '#d3e3d8',
    dropShadow: '0 20px 60px rgba(28,43,45,0.12)',
  },
} as const;

export const DARK: Tokens = {
  bg: {
    page: '#12161a',
    card: '#1a2027',
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
    default: '#2a323b',
    subtle: 'rgba(255,255,255,0.04)',
    strong: 'rgba(255,255,255,0.12)',
    input: 'rgba(255,255,255,0.10)',
    focus: '#5cb98a',
    divider: '#2a323b',
  },

  text: {
    primary: '#eef1f2',
    secondary: '#c3cbcf',
    muted: '#8b98a1',
    subtle: '#6b7880',
    disabled: '#4d5960',
    onDark: '#ffffff',
    link: '#5cb98a',
  },

  shadow: {
    card: '0 1px 2px rgba(0,0,0,0.3), 0 8px 28px rgba(0,0,0,0.4)',
    cardLg: '0 10px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
    focus: '0 0 0 3px rgba(92,185,138,0.25)',
    drop: '0 20px 60px rgba(0,0,0,0.5)',
  },

  income: {
    bg: '#1c2c26',
    bgIcon: 'rgba(92,185,138,0.15)',
    border: 'rgba(92,185,138,0.15)',
    text: '#5cb98a',
    textAlt: '#8fd1ac',
    shadow: 'rgba(92,185,138,0.08)',
  },

  expense: {
    bg: '#302019',
    bgIcon: 'rgba(224,134,112,0.15)',
    border: 'rgba(224,134,112,0.15)',
    text: '#e08670',
    textAlt: '#e8a190',
    shadow: 'rgba(224,134,112,0.08)',
  },

  balance: {
    bg: '#1a2027',
    bgIcon: 'rgba(255,255,255,0.07)',
    border: 'rgba(255,255,255,0.07)',
    text: '#eef1f2',
    textAlt: '#dde3e5',
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
    bg: 'rgba(224,188,107,0.08)',
    border: 'rgba(224,188,107,0.20)',
    text: '#e0bc6b',
  },

  info: {
    bg: 'rgba(99,102,241,0.12)',
    bgAlt: 'rgba(99,102,241,0.08)',
    border: 'rgba(99,102,241,0.25)',
    text: '#a5b4fc',
    textAlt: '#818cf8',
    shadow: 'rgba(99,102,241,0.15)',
  },

  extra: {
    bg: '#2f2a1a',
    bgIcon: 'rgba(224,188,107,0.18)',
    border: 'rgba(224,188,107,0.18)',
    text: '#e0bc6b',
    textAlt: '#eccf8f',
    shadow: 'rgba(224,188,107,0.08)',
  },

  receipt: {
    paper: '#1e242b',
    ink: '#dfe3e4',
    sub: '#7b8790',
    line: '#38414a',
  },

  quickInput: {
    bg: '#1a2027',
    border: 'rgba(92,185,138,0.18)',
    borderFocus: '#5cb98a',
    shadow: '0 0 0 3px rgba(92,185,138,0.20)',
    zapBg: 'rgba(92,185,138,0.15)',
    zapBgFocus: 'rgba(92,185,138,0.30)',
    dropBg: '#1a2027',
    dropBorder: 'rgba(92,185,138,0.25)',
    dropShadow: '0 20px 60px rgba(0,0,0,0.50)',
  },
};
