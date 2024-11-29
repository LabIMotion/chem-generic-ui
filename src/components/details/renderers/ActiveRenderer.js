import React from 'react';
import ButtonTooltip from '../../fields/ButtonTooltip';

const attrs = {
  true: {
    tip: 'tpl_de_act',
    fa: 'faCheck',
    bs: 'light',
    cls: 'gu_btn_text_success',
  },
  false: {
    tip: 'tpl_act',
    fa: 'faBan',
    bs: 'light',
    cls: 'gu_btn_text_danger',
  },
};

const ActiveRenderer = (params) => {
  const { data, fnDeActivate, node, value } = params;

  const onActivate = (e) => {
    node.setSelected(true, true);
    fnDeActivate(e);
  };

  return (
    <ButtonTooltip
      idf={attrs[value].tip}
      fnClick={onActivate}
      element={data}
      fa={attrs[value].fa}
      btnCls={`${attrs[value].cls} btn-sm`}
      bs={attrs[value].bs}
    />
  );
};

export default ActiveRenderer;
