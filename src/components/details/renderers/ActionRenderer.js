import React from 'react';
import AttrEditBtn from '../../designer/AttrEditBtn';
import AttrCopyBtn from '../../designer/AttrCopyBtn';

const ActionRenderer = params => {
  const { data, fnCopy, fnDelete, fnEdit, klasses, node, genericType } = params;

  const onSelect = () => {
    node.setSelected(true, true);
  };

  return (
    <span>
      <AttrCopyBtn
        data={data}
        fnSelect={onSelect}
        fnCopy={fnCopy}
        genericType={genericType}
        klasses={klasses || []}
      />
      &nbsp;
      <AttrEditBtn
        data={data}
        fnSelect={onSelect}
        fnDelete={fnDelete}
        fnEdit={fnEdit}
        genericType={genericType}
        klasses={klasses || []}
      />
    </span>
  );
};

export default ActionRenderer;
