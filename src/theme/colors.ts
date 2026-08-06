// Central Finance UI Theme Palette Configuration

export const themeColors = {
  primary: '#1A1A1E',
  primaryRgb: '26, 26, 30',
  primaryAccent: '#4F5DED',
  primaryAccentRgb: '79, 93, 237',
  primaryAccentHover: '#4350DC',
  primaryAccentActive: '#3743C9',
  
  success: '#2E9E6D',
  successRgb: '46, 158, 109',
  
  danger: '#D65A5A',
  dangerRgb: '214, 90, 90',
  
  warning: '#D9A441',
  warningRgb: '217, 164, 65',
  
  info: '#4F5DED',
  
  background: {
    light: '#FAFAFA',
    dark: '#161824',
  },
  
  surface: {
    light: '#FFFFFF',
    dark: '#23273C',
  },
  
  border: {
    light: '#E8E8EA',
    dark: '#2D324B',
  },
  
  text: {
    primaryLight: '#1A1A1E',
    primaryDark: '#FFFFFF',
    secondaryLight: '#6B6B72',
    secondaryDark: '#C8C7CD',
    muted: '#9E9EA5',
  },
  
  tableHover: {
    light: '#F1F1F8',
    dark: '#202436',
  },
  
  inputFocusRing: 'rgba(79, 93, 237, 0.15)',
  sidebarIconsOpacity: '1',
};

export const chartColors = {
  income: '#2E9E6D',
  expense: '#D65A5A',
  primary: '#4F5DED',
  neutral: '#D8D8DD',
  baseline: '#D8D8DD',
  primaryDark: '#1A1A1E',
  secondaryAccent: '#4F5DED',
  amber: '#D9A441',
};

// All categories share neutral tint background (#F1F1F8) with #4F5DED accent
export const categoryThemeMap: Record<string, { fill: string; track: string }> = {
  Salary: { fill: '#4F5DED', track: '#F1F1F8' },
  Income: { fill: '#2E9E6D', track: 'rgba(46, 158, 109, 0.12)' },
  Investment: { fill: '#4F5DED', track: '#F1F1F8' },
  Bills: { fill: '#4F5DED', track: '#F1F1F8' },
  Food: { fill: '#4F5DED', track: '#F1F1F8' },
  Medical: { fill: '#4F5DED', track: '#F1F1F8' },
  Entertainment: { fill: '#4F5DED', track: '#F1F1F8' },
  Transport: { fill: '#4F5DED', track: '#F1F1F8' },
  Shopping: { fill: '#4F5DED', track: '#F1F1F8' },
  Education: { fill: '#4F5DED', track: '#F1F1F8' },
  Other: { fill: '#4F5DED', track: '#F1F1F8' },
};

export default themeColors;
