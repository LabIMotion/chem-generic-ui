import React from 'react';
import ButtonTooltip from '../../fields/ButtonTooltip';
import { wfLayerMark } from '../../tools/utils';

const TemplateRenderer = (params) => {
  const {
    data, fnShow, fnShowJson, node
  } = params;
  const fa = ['fa-file-text', 'fa-file-code-o'];

  const onShow = (e) => {
    node.setSelected(true, true);
    fnShow(e);
  };

  const onShowJson = (e) => {
    node.setSelected(true, true);
    fnShowJson(e);
  };

  return (
    <span>
      <ButtonTooltip tip="edit template" fa={fa[0]} element={data} fnClick={onShow} />
      &nbsp;
      <ButtonTooltip tip="edit template in YAML" fa={fa[1]} element={data} fnClick={onShowJson} />
      &nbsp;
      {wfLayerMark(data.properties_template)}
    </span>
  );
};

export default TemplateRenderer;
