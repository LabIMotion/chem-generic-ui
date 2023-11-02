import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import ButtonTooltip from '../../fields/ButtonTooltip';

const renderWFLayerMark = props =>
  props && (props.flow || props.flowObject) ? (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="tooltip">A workflow is defined.</Tooltip>}
    >
      <i className="fa fa-sitemap" aria-hidden="true" />
    </OverlayTrigger>
  ) : null;

const TemplateRenderer = params => {
  const { data, fnShow, fnShowJson, node } = params;
  const fa = ['fa-file-text', 'fa-file-code-o'];

  const onShow = e => {
    node.setSelected(true, true);
    fnShow(e);
  };

  // const onShowJson = e => {
  //   node.setSelected(true, true);
  //   fnShowJson(e);
  // };

  return (
    <span>
      <ButtonTooltip
        tip="edit template"
        fa={fa[0]}
        element={data}
        fnClick={onShow}
      />
      {/* &nbsp;
      <ButtonTooltip
        tip="edit template in YAML"
        fa={fa[1]}
        element={data}
        fnClick={onShowJson}
      /> */}
      &nbsp;
      {renderWFLayerMark(data.properties_template)}
    </span>
  );
};

export default TemplateRenderer;
