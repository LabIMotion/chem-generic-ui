import React from 'react';
import AttrEditBtn from '../../designer/AttrEditBtn';
import AttrCopyBtn from '../../designer/AttrCopyBtn';
import ButtonTooltipFA from '../../fields/ButtonTooltipFA';

const ActionRenderer = (params) => {
  const {
    data,
    fnCopy,
    fnDelete,
    fnEdit,
    fnDownload,
    klasses,
    node,
    genericType,
  } = params;

  const onSelect = () => {
    node.setSelected(true, true);
  };

  const onDownload = (e) => {
    node.setSelected(true, true);
    fnDownload(e);
  };

  return (
    <span className="d-inline-flex gap-1">
      <AttrCopyBtn
        data={data}
        fnSelect={onSelect}
        fnCopy={fnCopy}
        genericType={genericType}
        klasses={klasses || []}
      />
      <AttrEditBtn
        data={data}
        fnSelect={onSelect}
        fnDelete={fnDelete}
        fnEdit={fnEdit}
        genericType={genericType}
        klasses={klasses || []}
      />
      <ButtonTooltipFA
        tip={`Export ${genericType} and its template`}
        fnClick={onDownload}
        element={data}
      />
    </span>
  );
};

export default ActionRenderer;
