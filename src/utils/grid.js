import Constants from '@components/tools/Constants';

const getPageSizeForTheme = (themeKey) => {
  const theme = Constants.GRID_THEME[themeKey];
  return theme?.PAGE_SIZE || 6;
};

export default getPageSizeForTheme;
