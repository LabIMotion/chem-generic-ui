/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Panel } from 'react-bootstrap';
import Draggable from 'react-draggable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import FlowView from './FlowView';

const FlowViewerModal = props => {
  const { show, data, fnHide } = props;
  if (!show) return null;
  const {
    properties_release: propertiesRelease,
    properties,
    shortLabel,
  } = data;
  if (Object.keys(propertiesRelease).length < 1) return null;
  if (
    Object.keys(propertiesRelease.flow || {}).length < 1 ||
    (propertiesRelease.flow.elements || []).length < 3
  ) {
    return (
      <Modal show={show} bsSize="small" onHide={fnHide}>
        <Modal.Header closeButton>
          <Modal.Title>{`${shortLabel} workflow`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>No defined workflow</Modal.Body>
      </Modal>
    );
  }

  return (
    <Draggable handle=".layer_header" bounds="body">
      <div className="flow_view_draggable">
        <Panel bsStyle="primary">
          <Panel.Heading className="layer_header">
            {`${shortLabel} workflow`}
            <Button
              bsStyle="danger"
              bsSize="xsmall"
              className="gu_button_right"
              onClick={fnHide}
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </Panel.Heading>
          <Panel.Body>
            <div className="body_bg">
              <div className="body_canvas">
                <FlowView
                  properties={properties}
                  propertiesRelease={propertiesRelease}
                />
              </div>
            </div>
          </Panel.Body>
        </Panel>
      </div>
    </Draggable>
  );
};

FlowViewerModal.propTypes = {
  show: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    properties_release: PropTypes.object,
    properties: PropTypes.object,
    shortLabel: PropTypes.string,
  }).isRequired,
  fnHide: PropTypes.func.isRequired,
};

export default FlowViewerModal;
