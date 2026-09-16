import React from 'react';
import AttrEditBtn from '@components/designer/AttrEditBtn';
import AttrCopyBtn from '@components/designer/AttrCopyBtn';
import TooltipButton from '@ui/common/TooltipButton';
import FIcons from '@components/icons/FIcons';
import { isWellplateSegment } from '@utils/wellplate';

function ActionRenderer(params) {
  const { data, fnCopy, fnDelete, fnEdit, fnDownload, node, genericType } =
    params;

  // A locked "Wellplates" segment can only be (de)activated, never copied,
  // edited, deleted or exported.
  const locked = isWellplateSegment(data, genericType);

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
        disabled={locked}
      />
      <AttrEditBtn
        data={data}
        fnSelect={onSelect}
        fnDelete={fnDelete}
        fnEdit={fnEdit}
        genericType={genericType}
        disabled={locked}
      />
      <TooltipButton
        tooltip={`Export ${genericType} and its template`}
        placement="top"
        delay={1000}
        overlayClassName="pre_line_tooltip"
        size="sm"
        variant="light"
        disabled={locked}
        onClick={() => onDownload(data)}
      >
        {FIcons.faFileExport}
      </TooltipButton>
    </span>
  );
}

export default ActionRenderer;
