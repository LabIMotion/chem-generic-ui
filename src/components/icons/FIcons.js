import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowsAlt,
  faArrowDown,
  faArrowRight,
  faArrowRightToBracket,
  faArrowsRotate,
  faArrowUp,
  faArrowsUpDownLeftRight,
  faBan,
  faCheck,
  faCircleArrowRight,
  faCircleCheck,
  faCircleInfo,
  faCirclePlus,
  faCircleQuestion,
  faDiagramProject,
  faDownLeftAndUpRightToCenter,
  faDownload,
  faExclamationCircle,
  faEye,
  faFlask,
  faFileExport,
  faFileImport,
  faFileLines,
  faFileWord,
  faGears,
  faLink,
  faMinus,
  faPaperclip,
  faPencil,
  faPlus,
  faReply,
  faRotate,
  faSquare,
  faTableCells,
  faTableCellsLarge,
  faTimes,
  faUpRightAndDownLeftFromCenter,
} from '@fortawesome/free-solid-svg-icons';
import {
  faClock,
  faClone,
  faFloppyDisk,
  faPaste,
  faTrashCan,
} from '@fortawesome/free-regular-svg-icons';

const icons = {
  faArrowsAlt,
  faArrowDown,
  faArrowRight,
  faArrowRightToBracket,
  faArrowsRotate,
  faArrowUp,
  faArrowsUpDownLeftRight,
  faBan,
  faCheck,
  faClock,
  faCircleArrowRight,
  faCircleCheck,
  faCircleInfo,
  faCirclePlus,
  faCircleQuestion,
  faClone,
  faDiagramProject,
  faDownLeftAndUpRightToCenter,
  faDownload,
  faExclamationCircle,
  faEye,
  faFlask,
  faFileExport,
  faFileImport,
  faFileLines,
  faFileWord,
  faFloppyDisk,
  faGears,
  faLink,
  faMinus,
  faPaperclip,
  faPaste,
  faPencil,
  faPlus,
  faReply,
  faRotate,
  faSquare,
  faTableCells,
  faTableCellsLarge,
  faTimes,
  faTrashCan,
  faUpRightAndDownLeftFromCenter,
};

export default Object.freeze(
  Object.fromEntries(
    Object.entries(icons).map(([key, value]) => [
      key,
      // eslint-disable-next-line react/jsx-key
      <FontAwesomeIcon icon={value} />,
    ])
  )
);
