import React from 'react';
import ButtonTooltip from '../../fields/ButtonTooltip';
import { LWf } from '../../shared/LCom';

const WFLayerMark = ({ data }) => {
  if (!data || (!data.flow && !data.flowObject)) {
    return null;
  }

  return <LWf wf />;
};

const TemplateRenderer = (params) => {
  const { data, fnShow, node } = params;

  const onShow = (e) => {
    node.setSelected(true, true);
    fnShow(e);
  };

  return (
    <span className="d-inline-flex align-items-center gap-1">
      <ButtonTooltip
        idf="tpl_edit"
        fa="faFileLines"
        element={data}
        fnClick={onShow}
        size="sm"
        bs="light"
      />
      <WFLayerMark data={data.properties_template} />
    </span>
  );
};

export default TemplateRenderer;
