import React from 'react';
import AttrEditBtn from '@components/designer/AttrEditBtn';
import AttrCopyBtn from '@components/designer/AttrCopyBtn';
import TooltipButton from '@ui/common/TooltipButton';
import FIcons from '@components/icons/FIcons';

const ActionRenderer = (params) => {
  const {
    data,
    fnCopy,
    fnDelete,
    fnEdit,
    fnDownload,
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
      />
      <AttrEditBtn
        data={data}
        fnSelect={onSelect}
        fnDelete={fnDelete}
        fnEdit={fnEdit}
        genericType={genericType}
      />
      <TooltipButton
        tooltip={`Export ${genericType} and its template`}
        placement="top"
        delay={1000}
        overlayClassName="pre_line_tooltip"
        size="sm"
        variant="light"
        onClick={() => onDownload(data)}
      >
        {FIcons.faFileExport}
      </TooltipButton>
    </span>
  );
};

export default ActionRenderer;
