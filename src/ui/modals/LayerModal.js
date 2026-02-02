/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Card } from 'react-bootstrap';
import sortBy from 'lodash/sortBy';
import FIcons from '@components/icons/FIcons';

const block = (layer, fnAdd, isEnabled) => (
  <Card key={layer.key} className="shadow-sm" style={{ width: '100%' }}>
    <Card.Body className="d-flex justify-content-between align-items-center p-3">
      <div>
        <Card.Title className="h6 mb-0">
          {layer.label}
          <span className="text-muted small me-2 fw-normal">
            {' '}
            ({layer.key})
          </span>
        </Card.Title>
      </div>
      <span
        title={isEnabled ? 'Add this layer' : 'This layer cannot be added'}
        style={{ cursor: isEnabled ? 'pointer' : 'not-allowed' }}
      >
        <Button
          size="sm"
          variant={isEnabled ? 'primary' : 'secondary'}
          onClick={(event) => fnAdd(event, layer)}
          disabled={!isEnabled}
        >
          {FIcons.faPlus} Add
        </Button>
      </span>
    </Card.Body>
  </Card>
);

function LayerModal(props) {
  const { show, generic, fnClose, fnAdd, selectedLayerKey } = props;
  if (!show) return null;

  const layers = generic.properties_release?.layers || {};
  const metadata = generic.metadata || {};

  const layerValues = Object.values(layers);
  if (layerValues.length < 1) return null;

  // Organize layers by groups - creates a mixed list of groups and ungrouped layers
  const organizeLayersByGroups = (layersObj, groupMetadata) => {
    const groups = groupMetadata.groups || [];
    const allLayers = Object.values(layersObj);

    // Get layers that belong to groups
    const groupedLayersSet = new Set();
    groups.forEach((group) => {
      group.layers?.forEach((layerKey) => groupedLayersSet.add(layerKey));
    });

    // Get ungrouped layers
    const ungroupedLayers = allLayers.filter(
      (layer) => !groupedLayersSet.has(layer.key),
    );

    // Create a mixed array of groups and ungrouped layers, sorted by position
    const items = [
      ...groups.map((group) => ({
        type: 'group',
        data: group,
        position: group.position || 0,
      })),
      ...ungroupedLayers.map((layer) => ({
        type: 'layer',
        data: layer,
        position: layer.position || 0,
      })),
    ];

    const sortedItems = sortBy(items, 'position');

    return {
      items: sortedItems,
      allLayers: layersObj,
    };
  };

  const organized = organizeLayersByGroups(layers, metadata);

  const isSelectedGrouped = (metadata.groups || []).some((group) =>
    group.layers?.includes(selectedLayerKey),
  );
  let selectedGroupId = null;
  if (isSelectedGrouped) {
    selectedGroupId = (metadata.groups || []).find((group) =>
      group.layers?.includes(selectedLayerKey),
    )?.id;
  }

  // Build layout with group headers
  const layout = [];
  organized.items.forEach((item) => {
    if (item.type === 'group') {
      const groupLayers =
        item.data.layers
          ?.map((layerKey) => organized.allLayers[layerKey])
          .filter(Boolean) || [];
      layout.push(
        <div
          key={`group-${item.data.id}`}
          className="p-3 pt-2 border rounded bg-light"
        >
          <h5>{item.data.label}</h5>
          <div className="d-flex flex-wrap gap-3">
            {groupLayers.map((layer) => {
              let isEnabled = false;
              if (!isSelectedGrouped) {
                // selected is ungrouped, disable grouped layers
                isEnabled = false;
              } else {
                // selected is grouped, enable only layers in same group
                isEnabled = item.data.id === selectedGroupId;
              }
              return block(layer, fnAdd, isEnabled);
            })}
          </div>
        </div>,
      );
    } else {
      // ungrouped layer
      let isEnabled = false;
      if (!isSelectedGrouped) {
        // selected is ungrouped, enable ungrouped layers
        isEnabled = true;
      } else {
        // selected is grouped, disable ungrouped layers
        isEnabled = false;
      }
      layout.push(block(item.data, fnAdd, isEnabled));
    }
  });

  return (
    <Modal size="lg" centered show={show} onHide={fnClose}>
      <Modal.Header closeButton>
        <Modal.Title>Choose Layer</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        <div className="d-flex flex-column gap-3">{layout}</div>
      </Modal.Body>
    </Modal>
  );
}

LayerModal.propTypes = {
  show: PropTypes.bool.isRequired,
  selectedLayerKey: PropTypes.string.isRequired,
  generic: PropTypes.object.isRequired,
  fnClose: PropTypes.func.isRequired,
  fnAdd: PropTypes.func.isRequired,
};

export default LayerModal;
