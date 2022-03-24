import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import './asserts/main.css';

library.add(fas, far);

export { default as ElementManager } from './components/admin/ElementManager';
export { default as GenButtonTooltip } from './components/fields/ButtonTooltip';
export { default as GenButtonConfirm } from './components/fields/ButtonConfirm';
export { default as GenButtonReload } from './components/fields/ButtonReload';
export { default as GenInterface } from './components/details/GenInterface';
export { default as GenericDSDetails } from './components/details/GenDSDetails';
export { default as SegmentDetails } from './components/details/GenSgDetails';
export { default as FlowViewerModal } from './components/flow/FlowViewerModal';
export { default as reinventGeneric } from './components/tools/reinventGeneric';
