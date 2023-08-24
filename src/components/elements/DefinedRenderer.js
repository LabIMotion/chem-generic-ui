import React from 'react';
import { FieldTypes } from 'generic-ui-core';
import SystemSelect from './SystemSelect';
import { molOptions, samOptions } from '../tools/utils';
import AttrChk from './AttrChk';

const DefinedRenderer = props => {
  const { unitConfig, node, selDefined, chkAttr, selectOptions } = props;
  if (node.data.type === 'select') {
    if (selectOptions.length > 0) {
      return (
        <SystemSelect
          unitConfig={selectOptions}
          selDefined={selDefined}
          node={node}
        />
      );
    }
    return null;
  }
  if (node.data.type === FieldTypes.F_SYSTEM_DEFINED)
    return (
      <SystemSelect
        unitConfig={unitConfig}
        selDefined={selDefined}
        node={node}
      />
    );
  if (node.data.type === FieldTypes.F_DRAG_MOLECULE)
    return <AttrChk chkAttr={chkAttr} node={node} attrOpts={molOptions} />;
  if (node.data.type === FieldTypes.F_DRAG_SAMPLE)
    return <AttrChk chkAttr={chkAttr} node={node} attrOpts={samOptions} />;
  return node.data.value || null;
};

export default DefinedRenderer;
