import { createEnum } from './utils';

export default Object.freeze({
  BTN_AI_LINK: 'link',
  BTN_AI_UNLINK: 'unlink',
  IMG_NOT_AVAILABLE_SVG: '/images/wild_card/not_available.svg',
  IMG_UNDEFINED_STRUCTURE_SVG: '/images/wild_card/undefined_structure.svg',
  NODE_TYPES: createEnum(['Input', 'Output', 'Default'], 'toLowerCase'),
  GENERIC_TYPES: createEnum(['Element', 'Segment', 'Dataset']),
  GRID_THEME: {
    ALPINE: { VALUE: 'ag-theme-alpine', PAGE_SIZE: 6 },
    BALHAM: { VALUE: 'ag-theme-balham', PAGE_SIZE: 10 },
  },
});
