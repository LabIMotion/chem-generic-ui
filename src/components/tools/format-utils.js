const capFirst = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/^[a-z]/, (match) => match.toUpperCase());
};
export default capFirst;
