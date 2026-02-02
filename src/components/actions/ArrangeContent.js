import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useEffect,
} from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Badge from 'react-bootstrap/Badge';
import sortBy from 'lodash/sortBy';
import { isLayerVisible } from 'generic-ui-core';
import FIcons from '@components/icons/FIcons';
import DragLayer from '@components/dnd/DragLayer';
import DnD from '@components/dnd/DnD';
import { bgColor } from '@components/tools/format-utils';
import { LHText } from '@components/shared/LCom';
import {
  defaultLayersContent,
  definedLayerHeader,
} from '@components/shared/arrangeUtils';
import { reorderPositions } from '@utils/template/sorting-handler';

const ArrangeContent = forwardRef(({ element }, ref) => {
  const layers = element?.properties?.layers || {};

  const initialMetadata = element?.metadata || { groups: [], restrict: {} };

  const [newLayers, setNewLayers] = useState(layers);
  const [newMetadata, setNewMetadata] = useState(initialMetadata);
  const scrollableContainerRef = useRef(null);

  // Initialize positions on mount
  useEffect(() => {
    const reordered = reorderPositions(layers, initialMetadata);
    setNewLayers(reordered.layers);
    setNewMetadata(reordered.metadata);
  }, []); // Empty deps - only run on mount

  // Expose method to get current state
  useImperativeHandle(ref, () => ({
    getUpdates: () => ({
      layers: newLayers,
      metadata: newMetadata,
    }),
  }));

  if (!element?.properties?.layers) return defaultLayersContent;

  const layerValues = Object.values(layers);
  if (layerValues.length === 0) return defaultLayersContent;

  // Organize layers by groups - creates a mixed list of groups and ungrouped layers
  const organizeLayersByGroups = (layersObj, metadata) => {
    const groups = metadata.groups || [];
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

  const currentOrganized = organizeLayersByGroups(layers, initialMetadata);
  const newOrganized = organizeLayersByGroups(newLayers, newMetadata);

  // Handle layer move within the same group (for grouped layers only)
  const handleLayerMove = (sourceKey, targetKey, groupId) => {
    // For grouped layers, reorder within the group's layers array
    // DO NOT change position values to avoid affecting top-level sorting
    const updatedGroups = [...(newMetadata.groups || [])];
    const groupIndex = updatedGroups.findIndex((g) => g.id === groupId);

    if (groupIndex === -1) return;

    const group = updatedGroups[groupIndex];
    const layersArray = group.layers || [];

    const sourceIndex = layersArray.indexOf(sourceKey);
    const targetIndex = layersArray.indexOf(targetKey);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // Reorder the array
    const newLayersArray = [...layersArray];
    const [removed] = newLayersArray.splice(sourceIndex, 1);
    newLayersArray.splice(targetIndex, 0, removed);

    updatedGroups[groupIndex] = {
      ...group,
      layers: newLayersArray,
    };

    setNewMetadata({
      ...newMetadata,
      groups: updatedGroups,
    });
  };

  // Handle top-level item move (groups and ungrouped layers)
  const handleTopLevelMove = (sourceKeyOrId, targetKeyOrId) => {
    // Find the source and target items from newOrganized
    const sourceIndex = newOrganized.items.findIndex(
      (item) =>
        (item.type === 'group' && item.data.id === sourceKeyOrId) ||
        (item.type === 'layer' && item.data.key === sourceKeyOrId),
    );

    const targetIndex = newOrganized.items.findIndex(
      (item) =>
        (item.type === 'group' && item.data.id === targetKeyOrId) ||
        (item.type === 'layer' && item.data.key === targetKeyOrId),
    );

    if (sourceIndex === -1 || targetIndex === -1) return;

    // Reorder the items array by moving source to target position
    const reorderedItems = [...newOrganized.items];
    const [movedItem] = reorderedItems.splice(sourceIndex, 1);
    reorderedItems.splice(targetIndex, 0, movedItem);

    // Reassign sequential positions to all items based on new order
    const updatedGroups = [...(newMetadata.groups || [])];
    const updatedLayers = { ...newLayers };

    reorderedItems.forEach((item, index) => {
      if (item.type === 'group') {
        const groupIndex = updatedGroups.findIndex(
          (g) => g.id === item.data.id,
        );
        if (groupIndex !== -1) {
          updatedGroups[groupIndex] = {
            ...updatedGroups[groupIndex],
            position: index,
          };
          // Update grouped layers to have the same position as their group
          updatedGroups[groupIndex].layers?.forEach((layerKey) => {
            if (updatedLayers[layerKey]) {
              updatedLayers[layerKey] = {
                ...updatedLayers[layerKey],
                position: index,
              };
            }
          });
        }
      } else if (item.type === 'layer') {
        const layerKey = item.data.key;
        if (updatedLayers[layerKey]) {
          updatedLayers[layerKey] = {
            ...updatedLayers[layerKey],
            position: index,
          };
        }
      }
    });

    // Update both states
    setNewMetadata({
      ...newMetadata,
      groups: updatedGroups,
    });
    setNewLayers(updatedLayers);
  };

  const block = (obj, isNew = false, groupId = null) => {
    const {
      label,
      color,
      style = 'panel_generic_heading',
      wf,
      key,
      fields,
    } = obj;
    const isVisible = isLayerVisible(obj, isNew ? newLayers : layers);
    if (!isVisible) return null;

    const content = (
      <div
        className={`${bgColor(color)} p-3 rounded`}
        style={{ userSelect: 'none' }}
      >
        {definedLayerHeader(style, label, key, fields, wf)}
      </div>
    );

    // If it's current view or workflow layer, return non-draggable content
    if ((!isNew && !groupId) || wf) {
      return (
        <div
          key={`${key}-${isNew ? 'new' : 'current'}`}
          className="w-100 p-2 m-2"
        >
          <div>{content}</div>
        </div>
      );
    }

    // For grouped layers, only allow DnD within the same group
    if (groupId) {
      return (
        <DnD
          key={`${key}-${isNew ? 'new' : 'current'}`}
          type={`layer-in-group-${groupId}`}
          layer={obj}
          field="position"
          handleMove={(sourceKey, targetKey) =>
            handleLayerMove(sourceKey, targetKey, groupId)
          }
          canDrag
        >
          {content}
        </DnD>
      );
    }

    // For ungrouped layers at top level, use top-level type
    return (
      <DnD
        key={`${key}-${isNew ? 'new' : 'current'}`}
        type="top-level-item"
        layer={{ type: 'layer', key, label, position: obj.position }}
        field="position"
        handleMove={(sourceKey, targetKey) =>
          handleTopLevelMove(sourceKey, targetKey)
        }
        canDrag
      >
        {content}
      </DnD>
    );
  };

  // Render individual layer block
  const renderLayer = (layer, isNew = false, groupId = null) =>
    block(layer, isNew, groupId);

  // Render group with its layers
  const renderGroup = (group, isNew = false) => {
    const groupLayers =
      group.layers
        ?.map(
          (layerKey) =>
            (isNew ? newOrganized : currentOrganized).allLayers[layerKey],
        )
        .filter(Boolean) || [];

    const groupContent = (
      <div
        className="border border-2 border-secondary rounded p-2 mb-2"
        key={`group-${group.id}-${isNew ? 'new' : 'current'}`}
        style={{ userSelect: 'none' }}
      >
        <div className="d-flex align-items-center mb-2">
          <Badge bg="secondary" className="me-2">
            {FIcons.faLayerGroup}
          </Badge>
          <strong>{group.label}</strong>
          {/* <span className="ms-auto text-muted small">
            (pos: {group.position})
          </span> */}
        </div>
        <div>
          {groupLayers.map((layer) => renderLayer(layer, isNew, group.id))}
          {groupLayers.length === 0 && (
            <div className="text-muted fst-italic">No layers in this group</div>
          )}
        </div>
      </div>
    );

    if (!isNew) {
      return (
        <div key={`group-${group.id}-current`} className="w-100 p-2 m-2">
          {groupContent}
        </div>
      );
    }

    // Groups are draggable at top level
    return (
      <DnD
        key={`group-${group.id}-new`}
        type="top-level-item"
        layer={{
          type: 'group',
          id: group.id,
          label: group.label,
          key: group.id,
          position: group.position,
        }}
        field="position"
        handleMove={(sourceKey, targetKey) =>
          handleTopLevelMove(sourceKey, targetKey)
        }
        canDrag
      >
        {groupContent}
      </DnD>
    );
  };

  // Render current arrangement - mixed list of groups and layers
  const renderCurrentArrangement = () => {
    const { items } = currentOrganized;

    return (
      <>
        {items.map((item) => {
          if (item.type === 'group') {
            return renderGroup(item.data, false);
          }
          return renderLayer(item.data, false, null);
        })}
      </>
    );
  };

  // Render new arrangement - mixed list of groups and layers
  const renderNewArrangement = () => {
    const { items } = newOrganized;

    return (
      <>
        {items.map((item) => {
          if (item.type === 'group') {
            return renderGroup(item.data, true);
          }
          return renderLayer(item.data, true, null);
        })}
      </>
    );
  };

  return (
    <div className="d-flex flex-column h-100">
      <Row className="mx-0 p-3">
        <Col md={6}>
          <LHText title="Current Arrangement">The existing arrangement</LHText>
        </Col>
        <Col md={6} className="text-primary">
          <LHText title="New Arrangement">
            Drag ({FIcons.faArrowsUpDownLeftRight}) groups and layers to
            reorder. Layers within groups can only be reordered within their
            group.
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
          position: 'relative',
        }}
      >
        <Row className="mx-0 h-100">
          <Col md={6} style={{ position: 'relative' }}>
            {renderCurrentArrangement()}
          </Col>
          <Col md={6} style={{ position: 'relative' }}>
            {renderNewArrangement()}
          </Col>
        </Row>
      </div>
      <DragLayer scrollableContainerRef={scrollableContainerRef} />
    </div>
  );
});

ArrangeContent.displayName = 'ArrangeContent';

export default ArrangeContent;
