import React from 'react';
import ButtonTooltip from '../../fields/ButtonTooltip';

const attrs = {
  true: {
    tip: 'click to de-activate this template (currently active)',
    fa: 'fa-check',
    bs: 'success',
    cls: 'gu_btn_text_success',
  },
  false: {
    tip: 'click to activate this template (currently inactive)',
    fa: 'fa-ban',
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
      btnCls={attrs[value].cls}
    />
  );
};

export default ActiveRenderer;
