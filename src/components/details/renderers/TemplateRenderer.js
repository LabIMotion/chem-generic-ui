import React from 'react';
import ButtonTooltip from '@components/fields/ButtonTooltip';
import { LWf } from '@components/shared/LCom';
import { isWellplateSegment } from '@utils/wellplate';

function WFLayerMark({ data }) {
  if (!data || (!data.flow && !data.flowObject)) {
    return null;
  }

  return <LWf wf />;
}

function TemplateRenderer(params) {
  const { data, fnShow, node, genericType } = params;

  // The locked "Wellplates" segment template is not editable from the list.
  const locked = isWellplateSegment(data, genericType);

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
        disabled={locked}
      />
      <WFLayerMark data={data.properties_template} />
    </span>
  );
}

export default TemplateRenderer;
