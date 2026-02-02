/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card, Modal } from 'react-bootstrap';
import Draggable from 'react-draggable';
import FlowView from '@components/flow/FlowView';
import FIcons from '@components/icons/FIcons';

const FlowViewerModal = (props) => {
  const { show, data, fnHide } = props;
  if (!show) return null;
  const {
    properties_release: propertiesRelease,
    properties,
    shortLabel,
    flowType,
  } = data;
  if (Object.keys(propertiesRelease || {}).length < 1) return null;

  const hasFlow =
    (Object.keys(propertiesRelease.flow || {}).length > 0 &&
      propertiesRelease.flow?.elements?.length > 2) ||
    false;
  const hasFlowObject =
    (Object.keys(propertiesRelease.flowObject || {}).length > 0 &&
      propertiesRelease.flowObject?.nodes?.length > 2) ||
    false;

  if (!hasFlow && !hasFlowObject) {
    return (
      <Modal centered show={show} size="sm" onHide={fnHide}>
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
        <Card variant="info">
          <Card.Header className="layer_header">
            {`${shortLabel} workflow`}
            <Button
              size="sm"
              variant="danger"
              className="gu_button_right"
              onClick={fnHide}
            >
              {FIcons.faTimes}
            </Button>
          </Card.Header>
          <Card.Body>
            <div className="body_bg">
              <div className="body_canvas">
                <FlowView
                  properties={properties}
                  propertiesRelease={propertiesRelease}
                  flowType={flowType}
                />
              </div>
            </div>
          </Card.Body>
        </Card>
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
    flowType: PropTypes.string,
  }).isRequired,
  fnHide: PropTypes.func.isRequired,
};

export default FlowViewerModal;
