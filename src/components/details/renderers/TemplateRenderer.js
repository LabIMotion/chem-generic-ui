import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ButtonTooltip from '../../fields/ButtonTooltip';
import FIcons from '../../icons/FIcons';

const renderWFLayerMark = props =>
  props && (props.flow || props.flowObject) ? (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="tooltip">A workflow is defined.</Tooltip>}
    >
      {FIcons.faDiagramProject}
    </OverlayTrigger>
  ) : null;

const TemplateRenderer = params => {
  const { data, fnShow, node } = params;
  const fa = ['fa-file-text', 'fa-file-code-o'];

  const onShow = e => {
    node.setSelected(true, true);
    fnShow(e);
  };

  return (
    <span>
      <ButtonTooltip
        tip="edit template"
        fa={fa[0]}
        element={data}
        fnClick={onShow}
      />
      &nbsp;
      {renderWFLayerMark(data.properties_template)}
    </span>
  );
};

export default TemplateRenderer;
