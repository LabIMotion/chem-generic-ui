import Constants from '@components/tools/Constants';

// Toggle this to switch all grids between modes:
//   'theming-api' — uses theme objects (v33 default, no CSS imports needed)
//   'legacy'      — uses CSS classes (requires ag-grid CSS imports in entry.js)
const THEME_MODE = 'legacy';

/**
 * Resolve theme props and wrapper className for a given theme key.
 * @param {string} themeKey - 'QUARTZ' | 'BALHAM' | 'ALPINE'
 * @returns {{ themeProps: object, wrapperClassName: string|undefined }}
 */
export const resolveGridTheme = (themeKey = 'QUARTZ') => {
  const entry = Constants.GRID_THEME[themeKey];
  if (THEME_MODE === 'legacy') {
    return {
      themeProps: { theme: 'legacy' },
      wrapperClassName: entry.VALUE,
    };
  }
  return {
    themeProps: { theme: entry.THEME },
    wrapperClassName: undefined,
  };
};

export default THEME_MODE;
