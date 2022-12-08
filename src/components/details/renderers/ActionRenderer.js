import React from 'react';
import ButtonTooltip from '../../fields/ButtonTooltip';

const ActionRenderer = (params) => {
  const {
    data, fnCopy, fnEdit, node
  } = params;

  const onCopy = (e) => {
    node.setSelected(true, true);
    fnCopy(e);
  };

  const onEdit = (e) => {
    node.setSelected(true, true);
    fnEdit(e);
  };

  return (
    <span>
      <ButtonTooltip tip="copy to ..." fa="fa fa-clone" element={data} fnClick={onCopy} />
      &nbsp;
      <ButtonTooltip tip="edit attributes" element={data} fnClick={onEdit} />
    </span>
  );
};

export default ActionRenderer;
