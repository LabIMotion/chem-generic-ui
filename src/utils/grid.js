import Constants from '../components/tools/Constants';

const getPageSizeForTheme = themeName => {
  const theme = Object.values(Constants.GRID_THEME).find(
    obj => obj.VALUE === themeName
  );
  return theme?.PAGE_SIZE || 6;
};

export default getPageSizeForTheme;
