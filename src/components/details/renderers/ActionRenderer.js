import React from 'react';
import AttrEditBtn from '../../designer/AttrEditBtn';
import AttrCopyBtn from '../../designer/AttrCopyBtn';

const ActionRenderer = params => {
  const { data, fnCopy, fnDelete, fnEdit, klasses, node } = params;

  const onSelect = () => {
    node.setSelected(true, true);
  };

  return (
    <span>
      <AttrCopyBtn
        data={data}
        fnSelect={onSelect}
        fnCopy={fnCopy}
        genericType="Element"
        klasses={klasses || []}
      />
      &nbsp;
      <AttrEditBtn
        data={data}
        fnSelect={onSelect}
        fnDelete={fnDelete}
        fnEdit={fnEdit}
        genericType="Element"
        klasses={klasses || []}
      />
    </span>
  );
};

export default ActionRenderer;
