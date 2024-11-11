import React, { forwardRef, useImperativeHandle, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import sortBy from 'lodash/sortBy';
import { isLayerVisible, moveLayer } from 'generic-ui-core';
import FIcons from '../icons/FIcons';
import DnD from '../dnd/DnD';
import Constants from '../tools/Constants';
import { bgColor } from '../tools/format-utils';
import { LHText, LWf } from '../shared/LCom';

const extHeaderInfo = (splitKey) => {
  return splitKey.length > 1 ? (
    <span>{`Repetition ${splitKey[1]}`}</span>
  ) : null;
};

const sysHeaderInfo = (fields) => {
  const preText = 'Reaction:';
  if (!fields || !fields.length) return preText;
  const { value = {} } = fields[0];
  return value.el_label ? `${preText} ${value.el_label}` : preText;
};

const defaultContent = <h1>No layers to arrange</h1>;
const definedHeader = (className, label, key, fields, wf) => {
  const isSys = key.startsWith(Constants.SYS_REACTION);
  const content = isSys ? sysHeaderInfo(fields) : `${label}(${key})`;
  const splitKey = key.split('.');
  return (
    <span
      className={`d-flex justify-content-between align-items-center ${className}`}
    >
      {content}
      {extHeaderInfo(splitKey)}
      <LWf wf={wf} />
    </span>
  );
};

const ArrangeContent = forwardRef(({ element }, ref) => {
  // Initialize state with empty object or layers
  const layers = element?.properties?.layers || {};
  // Initialize state with the original layers
  const [newLayers, setNewLayers] = useState(layers);

  // Expose method to get current newLayers value
  useImperativeHandle(ref, () => ({
    getUpdates: () => newLayers,
  }));

  if (!element?.properties?.layers) return defaultContent;

  const layerValues = Object.values(layers);
  if (layerValues.length === 0) return defaultContent;

  const handleMove = (sourceKey, targetKey) => {
    const updatedLayers = moveLayer(newLayers, sourceKey, targetKey);
    setNewLayers(updatedLayers);
  };

  // Use different source for current and new arrangements
  const currentSortedLayers =
    sortBy(Object.values(layers), ['position', 'wf_position']) || [];
  const newSortedLayers =
    sortBy(Object.values(newLayers), ['position', 'wf_position']) || [];

  const block = (obj, isNew = false) => {
    const {
      label,
      color,
      style = 'panel_generic_heading',
      wf,
      key,
      fields,
    } = obj;
    const isVisible = isLayerVisible(obj, layers);
    if (!isVisible) return null;

    const content = (
      <div className={`${bgColor(color)} p-3 rounded`}>
        {definedHeader(style, label, key, fields, wf)}
      </div>
    );

    // If it's current view or workflow layer, return non-draggable content
    if (!isNew || wf) {
      return (
        <div
          key={`${key}-${isNew ? 'new' : 'current'}`}
          className="w-100 p-2 m-2"
        >
          <div>{content}</div>
        </div>
      );
    }

    return (
      <DnD
        key={`${key}-${isNew ? 'new' : 'current'}`}
        type="layer"
        layer={obj}
        field="position"
        handleMove={handleMove}
        canDrag
      >
        {content}
      </DnD>
    );
  };

  const layersListCurrent = currentSortedLayers
    .map((layer) => block(layer, false))
    .filter(Boolean);
  const layersListNew = newSortedLayers
    .map((layer) => block(layer, true))
    .filter(Boolean);

  return (
    <div className="d-flex flex-column h-100">
      <Row className="mx-0 p-3">
        <Col md={6}>
          <LHText title="Current Arrangement">The existing arrangement</LHText>
        </Col>
        <Col md={6} className="text-primary">
          <LHText title="New Arrangement">
            Drag and drop ({FIcons.faArrowsUpDownLeftRight}) to reorder layers (
            workflow layers (<LWf wf />) cannot be moved )
          </LHText>
        </Col>
      </Row>
      <Row className="mx-0 flex-grow-1" style={{ minHeight: 0 }}>
        <Col
          md={6}
          className="h-100 border-end border-primary"
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
          }}
        >
          {layersListCurrent}
        </Col>
        <Col
          md={6}
          className="h-100"
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
          }}
        >
          {layersListNew}
        </Col>
      </Row>
    </div>
  );
});

ArrangeContent.displayName = 'ArrangeContent';

export default ArrangeContent;
