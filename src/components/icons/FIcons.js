import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { findIconDefinition } from '@fortawesome/fontawesome-svg-core';
import '@components/icons/fa4-to-fa7-map'; // ensures library.add(fas, far) runs

const SOLID_ICONS = [
  'faAnglesDown',
  'faAnglesUp',
  'faArrowsAlt',
  'faArrowCircleDown',
  'faArrowDown',
  'faArrowRight',
  'faArrowRightToBracket',
  'faArrowsRotate',
  'faArrowUp',
  'faArrowUpRightFromSquare',
  'faArrowsLeftRight',
  'faArrowsUpDownLeftRight',
  'faBan',
  'faBars',
  'faBarsProgress',
  'faBookOpen',
  'faCaretDown',
  'faCaretLeft',
  'faCaretRight',
  'faCaretUp',
  'faChartDiagram',
  'faCheck',
  'faChevronDown',
  'faChevronUp',
  'faCircleArrowRight',
  'faCircleCheck',
  'faCircleInfo',
  'faCirclePlus',
  'faClockRotateLeft',
  'faCubesStacked',
  'faDiagramProject',
  'faDownLeftAndUpRightToCenter',
  'faDownload',
  'faEllipsis',
  'faEllipsisVertical',
  'faExclamationCircle',
  'faEye',
  'faFlask',
  'faFileExport',
  'faFileImport',
  'faFileLines',
  'faFileWord',
  'faGears',
  'faGlobe',
  'faGripLinesVertical',
  'faLayerGroup',
  'faLink',
  'faList',
  'faMagnifyingGlass',
  'faMinus',
  'faObjectGroup',
  'faPaintbrush',
  'faPaperclip',
  'faPaperPlane',
  'faPencil',
  'faPlus',
  'faReply',
  'faRotate',
  'faSpellCheck',
  'faSquare',
  'faT',
  'faTag',
  'faTableCells',
  'faTableCellsLarge',
  'faTimes',
  'faExpandArrowsAlt',
  'faCompressArrowsAlt',
  'faTriangleExclamation',
  'faUpRightAndDownLeftFromCenter',
];

const REGULAR_ICONS = [
  'faChartBar',
  'faClock',
  'faClone',
  'faCircleQuestion',
  'faFloppyDisk',
  'faPaste',
  'faSquareCaretDown',
  'faTrashCan',
];

// Convert camelCase "faArrowDown" to kebab "arrow-down"
function toIconName(camel) {
  return camel
    .replace(/^fa/, '')
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

function resolve(camel, prefix) {
  return findIconDefinition({ prefix, iconName: toIconName(camel) });
}

function buildEntries(names, prefix) {
  return names.map((key) => [
    key,
    // eslint-disable-next-line react/jsx-key
    <FontAwesomeIcon icon={resolve(key, prefix)} />,
  ]);
}

const icons = Object.freeze(
  Object.fromEntries([
    ...buildEntries(SOLID_ICONS, 'fas'),
    ...buildEntries(REGULAR_ICONS, 'far'),
  ]),
);

const animated = Object.freeze({
  faSpinner: <FontAwesomeIcon icon={resolve('faSpinner', 'fas')} spin />,
});

export default { ...icons, ...animated };
