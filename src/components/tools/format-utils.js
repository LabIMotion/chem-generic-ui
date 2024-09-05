const capFirst = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/^[a-z]/, (match) => match.toUpperCase());
};

const pl = (count, singular) => {
  const irregulars = {
    data: 'data',
  };
  if (count <= 1) return singular;
  if (irregulars[singular]) return irregulars[singular];
  return singular.endsWith('s') ? singular : `${singular}s`;
};

export { capFirst, pl };
