import MC from './MC';
import {
  notifyError,
  notifySuccess,
} from '../../utils/template/designer-message';

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

// snakeToCamel
const s2c = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  return str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );
};

// camelToSnake
const c2s = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
};

// pascalToSnake
const p2s = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  return str
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();
};

// messageCodeToResponse
const mc2res = (code, msg = '') => {
  if (!MC[code]) return notifyError();
  const isSuccess = /s/.test(code[1]);
  const finalMsg = msg ? `${MC[code]} ${msg}` : MC[code];
  return isSuccess ? notifySuccess(finalMsg) : notifyError(finalMsg);
};

const bgColor = (color = 'default') => {
  switch (color) {
    case 'default':
      return 'bg-light';
    case 'none':
      return 'bg-white';
    default:
      return `bg-${color}`;
  }
};

export { capFirst, pl, s2c, p2s, c2s, mc2res, bgColor };
