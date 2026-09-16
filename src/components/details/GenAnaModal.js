/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import Constants from '@components/tools/Constants';
import GModal from '@ui/modals/GModal';

function NoDataModal(props) {
  const { show, title, fnHide } = props;
  return (
    <GModal show={show} size="sm" onHide={fnHide}>
      <GModal.Header>
        <GModal.Title>{title}</GModal.Title>
      </GModal.Header>
      <GModal.Body>No Data</GModal.Body>
    </GModal>
  );
}

function GenAnaModal(props) {
  const { show, generic, layer, fnHide, fnLink } = props;
  if (!show) return null;
  const { name, container, properties } = generic;
  const specLayer = properties && properties.layers && properties.layers[layer];
  const title = specLayer.label || '(no label)';
  let ai =
    (container && container.children && container.children[0].children) || [];
  ai = ai.filter((x) => !x.is_new);
  if (ai.length < 1 || !title) {
    return (
      <NoDataModal
        show={show}
        title={`Analyses, select to link to Layer ${title}`}
        fnHide={fnHide}
      />
    );
  }

  const layerAi = specLayer.ai || [];
  const row = (_ai) => (
    <div key={`_row_linked_analysis_${_ai.id}_${layer}`}>
      <div className="generic_grid_row generic_grid_row_left">{_ai.name}</div>
      <div className="generic_grid_row generic_grid_row_left">
        <Button
          size="sm"
          variant="success"
          className="gu_button_right"
          onClick={() => fnLink(_ai.id, layer, Constants.BTN_AI_LINK)}
          disabled={layerAi.includes(_ai.id)}
        >
          {Constants.BTN_AI_LINK}
        </Button>
        <Button
          size="sm"
          variant="danger"
          className="gu_button_right"
          onClick={() => fnLink(_ai.id, layer, Constants.BTN_AI_UNLINK)}
          disabled={!layerAi.includes(_ai.id)}
        >
          {Constants.BTN_AI_UNLINK}
        </Button>
      </div>
    </div>
  );

  const rows = [];
  ai.forEach((_ai) => {
    rows.push(row(_ai));
  });

  return (
    <GModal size="lg" show={show} onHide={fnHide}>
      <GModal.Header>
        <GModal.Title>
          <b>{name}</b> Analyses
          <br />
          select to link/unlink to Layer <b>{title}</b>
        </GModal.Title>
      </GModal.Header>
      <GModal.Body>
        <div style={{ maxHeight: '80vh', overflow: 'auto' }}>
          <div className="generic_grid">{rows}</div>
        </div>
      </GModal.Body>
    </GModal>
  );
}

GenAnaModal.propTypes = {
  show: PropTypes.bool.isRequired,
  generic: PropTypes.object.isRequired,
  layer: PropTypes.string.isRequired,
  fnHide: PropTypes.func.isRequired,
  fnLink: PropTypes.func.isRequired,
};

export default GenAnaModal;
