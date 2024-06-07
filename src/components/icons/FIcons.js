import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowsAlt,
  faArrowsRotate,
  faArrowsUpDownLeftRight,
  faBan,
  faCircleCheck,
  faCirclePlus,
  faDiagramProject,
  faExclamationCircle,
  faFlask,
  faFileWord,
  faFloppyDisk,
  faMinus,
  faPaperclip,
  faPencil,
  faPlus,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

const icons = {
  faArrowsAlt,
  faArrowsRotate,
  faArrowsUpDownLeftRight,
  faBan,
  faCircleCheck,
  faCirclePlus,
  faDiagramProject,
  faExclamationCircle,
  faFlask,
  faFileWord,
  faFloppyDisk,
  faMinus,
  faPaperclip,
  faPencil,
  faPlus,
  faTimes,
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
