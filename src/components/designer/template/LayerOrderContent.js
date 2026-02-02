import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
} from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import sortBy from 'lodash/sortBy';
import { moveLayer } from 'generic-ui-core';
import DragLayer from '@components/dnd/DragLayer';
import DnD from '@components/dnd/DnD';
import { bgColor } from '@components/tools/format-utils';
import FIcons from '@components/icons/FIcons';
import ConditionsDisplay from '@components/designer/template/ConditionsDisplay';
import { LHText } from '@components/shared/LCom';
import {
  defaultLayersContent,
  definedLayerHeader,
} from '@components/shared/arrangeUtils';

const LayerOrderContent = forwardRef(({ element }, ref) => {
  // Initialize state with empty object or layers
  const layers = element?.properties_template?.layers || {};
  // Initialize state with the original layers
  const [newLayers, setNewLayers] = useState(layers);

  // Create ref for scrollable container
  const scrollableContainerRef = useRef(null);

  // Expose method to get current newLayers value
  useImperativeHandle(ref, () => ({
    getUpdates: () => newLayers,
  }));

  if (!element?.properties_template?.layers) return defaultLayersContent;

  const layerValues = Object.values(layers);
  if (layerValues.length === 0) return defaultLayersContent;

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
    const { label, color, style = 'panel_generic_heading', key, fields } = obj;

    const contentStyle = `p-3 rounded border border-${
      isNew ? 'primary' : 'secondary'
    } `;

    const content = (
      <div className={`${bgColor()} ${contentStyle}`}>
        {definedLayerHeader(style, label, key, fields)}
        <ConditionsDisplay conditions={obj} />
      </div>
    );

    // If it's current view or workflow layer, return non-draggable content
    if (!isNew) {
      return (
        <div
          key={`${key}-${isNew ? 'new' : 'current'}`}
          // className="w-100 p-2 m-2"
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
            Drag and drop ({FIcons.faArrowsUpDownLeftRight}) to reorder layers
          </LHText>
        </Col>
      </Row>
      <div
        ref={scrollableContainerRef}
        className="flex-grow-1"
        style={{
          overflowY: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          position: 'relative', // Important for DnD context
        }}
      >
        <Row className="mx-0 h-100">
          <Col
            md={6}
            style={{
              position: 'relative',
            }}
          >
            {layersListCurrent}
          </Col>
          <Col
            md={6}
            style={{
              position: 'relative',
            }}
          >
            {layersListNew}
          </Col>
        </Row>
      </div>
      <DragLayer scrollableContainerRef={scrollableContainerRef} />
    </div>
  );
});

LayerOrderContent.displayName = 'LayerOrderContent';

export default LayerOrderContent;
