import React from 'react';
import ButtonTooltip from '../../fields/ButtonTooltip';

const attrs = {
  true: {
    tip: 'Click to de-activate this template (currently active)',
    fa: 'faCheck',
    bs: 'success',
    cls: 'gu_btn_text_success',
  },
  false: {
    tip: 'Click to activate this template (currently inactive)',
    fa: 'faBan',
    bs: 'danger',
    cls: 'gu_btn_text_danger',
  },
};

const ActiveRenderer = params => {
  const { data, fnDeActivate, node, value } = params;

  const onActivate = e => {
    node.setSelected(true, true);
    fnDeActivate(e);
  };

  return (
    <ButtonTooltip
      tip={attrs[value].tip}
      fnClick={onActivate}
      element={data}
      fa={attrs[value].fa}
      btnCls={`${attrs[value].cls} btn-gxs`}
    />
  );
};

export default ActiveRenderer;
