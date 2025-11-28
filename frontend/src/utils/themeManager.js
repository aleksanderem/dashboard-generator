/**
 * Theme manager for dashboard colors
 */

export const themes = {
  itsm: {
    name: 'ITSM',
    primary: '#9333EA',
    primaryLight: '#E9D5FF',
    primaryDark: '#7E22CE',
  },
  security: {
    name: 'Security',
    primary: '#FFCC24',
    primaryLight: '#FEF3C7',
    primaryDark: '#EAB308',
  },
  monitoring: {
    name: 'Monitoring',
    primary: '#0078B5',
    primaryLight: '#BAE6FD',
    primaryDark: '#0369A1',
  },
  ad: {
    name: 'AD',
    primary: '#C92133',
    primaryLight: '#FECACA',
    primaryDark: '#991B1B',
  },
  uem: {
    name: 'UEM',
    primary: '#00994F',
    primaryLight: '#BBF7D0',
    primaryDark: '#166534',
  },
  custom: {
    name: 'Custom',
    primary: '#138D8F',
    primaryLight: '#CCFBF1',
    primaryDark: '#0F6B6D',
  },
  teal: {
    name: 'Teal',
    primary: '#14B8A6',
    primaryLight: '#CCFBF1',
    primaryDark: '#0D9488',
  },
};

/**
 * Apply theme to document
 * @param {string} themeName - Theme name from themes object
 */
export function applyTheme(themeName) {
  const theme = themes[themeName] || themes.teal;

  document.documentElement.style.setProperty('--theme-primary', theme.primary);
  document.documentElement.style.setProperty('--theme-primary-light', theme.primaryLight);
  document.documentElement.style.setProperty('--theme-primary-dark', theme.primaryDark);
}

/**
 * Get theme color
 * @param {string} themeName - Theme name
 * @returns {string} Primary color
 */
export function getThemeColor(themeName) {
  return themes[themeName]?.primary || themes.teal.primary;
}

/**
 * Get all available theme names
 * @returns {string[]} Array of theme names
 */
export function getThemeNames() {
  return Object.keys(themes);
}
