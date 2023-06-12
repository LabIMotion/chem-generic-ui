import { createEnum } from '../tools/utils';
import { initialNodes } from '../../utils/flow/initial-flow';

export const NodeTypes = createEnum(
  ['Input', 'Output', 'Default'],
  'toLowerCase'
);
export const FlowInit = Object.freeze({
  // INTI_NODES, to replace flowDefault
  INTI_NODES: initialNodes,
});
