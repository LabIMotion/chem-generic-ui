import React from 'react';
import AttrEditBtn from '../../designer/AttrEditBtn';
import AttrCopyBtn from '../../designer/AttrCopyBtn';
import ButtonTooltip from '../../fields/ButtonTooltip';

const ActionRenderer = params => {
  const { data, fnCopy, fnDelete, fnEdit, fnDownload, klasses, node, genericType } = params;

  const onSelect = () => {
    node.setSelected(true, true);
  };

  const onDownload = e => {
    node.setSelected(true, true);
    fnDownload(e);
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
      &nbsp;
      <ButtonTooltip
        tip="Download"
        fnClick={onDownload}
        element={data}
        fa="fa-download"
    />
    </span>
  );
};

export default ActionRenderer;
