import React from 'react';
import ButtonTooltip from '../../fields/ButtonTooltip';
import FIcons from '../../icons/FIcons';
import LTooltip from '../../shared/LTooltip';

const renderWFLayerMark = (props) =>
  props && (props.flow || props.flowObject) ? (
    <LTooltip idf="fl_defined">{FIcons.faDiagramProject}</LTooltip>
  ) : null;

const TemplateRenderer = (params) => {
  const { data, fnShow, node } = params;

  const onShow = e => {
    node.setSelected(true, true);
    fnShow(e);
  };

  return (
    <span>
      <ButtonTooltip
        idf="tpl_edit"
        fa="faFileLines"
        element={data}
        fnClick={onShow}
        btnCls="btn-gxs"
      />
      &nbsp;
      {renderWFLayerMark(data.properties_template)}
    </span>
  );
};

export default TemplateRenderer;
