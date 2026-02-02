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
import Button from 'react-bootstrap/Button';
import sortBy from 'lodash/sortBy';
import DragLayer from '@components/dnd/DragLayer';
import DnD from '@components/dnd/DnD';
import { bgColor } from '@components/tools/format-utils';
import FIcons from '@components/icons/FIcons';
import ConditionView from '@components/designer/template/ConditionView';
import { LHText } from '@components/shared/LCom';
import {
  defaultLayersContent,
  DefinedLayerHeader,
} from '@components/shared/arrangeUtils';
import { reorderPositions } from '@utils/template/sorting-handler';

const GroupLayerOrderContent = forwardRef(({ element }, ref) => {
  const layers = element?.properties_template?.layers || {};

  const initialMetadata = element?.metadata || { groups: [], restrict: {} };

  const [newLayers, setNewLayers] = useState(layers);
  const [newMetadata, setNewMetadata] = useState(initialMetadata);
  const scrollableContainerRef = useRef(null);
  const [expandedConditions, setExpandedConditions] = useState(new Set());

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

  if (!element?.properties_template?.layers) return defaultLayersContent;

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
  // This receives keys/ids from DnD and needs to look up the actual items
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

  // Render individual layer block
  const renderLayer = (layer, isNew = false, groupId = null) => {
    const {
      label,
      color,
      style = 'panel_generic_heading',
      key,
      fields,
    } = layer;

    const contentStyle = `p-3 rounded border border-${
      isNew ? 'primary' : 'secondary'
    }`;

    const hasConditions = layer.cond_fields && layer.cond_fields.length > 0;
    const isExpanded = expandedConditions.has(key);

    const handleToggleConditions = (e) => {
      e.stopPropagation();
      const newExpanded = new Set(expandedConditions);
      if (isExpanded) {
        newExpanded.delete(key);
      } else {
        newExpanded.add(key);
      }
      setExpandedConditions(newExpanded);
    };

    const content = (
      <div className={`${bgColor()} ${contentStyle}`}>
        <div className="d-flex align-items-center">
          <DefinedLayerHeader
            className={style}
            label={label}
            keyProp={key}
            fields={fields}
            wf={layer.wf}
          >
            <span className="ms-auto">
              {/* {layer.position !== undefined && layer.position !== null && (
                <span className="text-muted small me-2 fw-normal">
                  (pos: {layer.position})
                </span>
              )} */}
              {hasConditions && (
                <Button
                  variant="outline-secondary"
                  size="xsm"
                  onClick={handleToggleConditions}
                >
                  {FIcons.faGears} {isExpanded ? 'Hide' : 'Show'} Restrictions
                </Button>
              )}
            </span>
          </DefinedLayerHeader>
        </div>
        {hasConditions && isExpanded && (
          <div className="mt-2">
            <ConditionView conditions={layer} layers={layers} />
          </div>
        )}
      </div>
    );

    if (!isNew) {
      return groupId ? (
        <div key={`layer-${key}-current`} className="w-100 p-2 m-2">
          {content}
        </div>
      ) : (
        content
      );
    }

    // For grouped layers, only allow DnD within the same group
    if (groupId) {
      return (
        <DnD
          key={`layer-${key}-new`}
          type={`layer-in-group-${groupId}`}
          layer={layer}
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
        key={`layer-${key}-new`}
        type="top-level-item"
        layer={{ type: 'layer', key, label, position: layer.position }}
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

  // Render group with its layers
  const renderGroup = (group, isNew = false) => {
    const groupLayers =
      group.layers
        ?.map(
          (layerKey) =>
            (isNew ? newOrganized : currentOrganized).allLayers[layerKey],
        )
        .filter(Boolean) || [];
    // Use array order, NOT position-based sorting, to prevent affecting top-level order
    const sortedGroupLayers = groupLayers;

    // Get restrictions
    const metadata = isNew ? newMetadata : initialMetadata;
    const groupRestrict = metadata?.restrict?.[group.id];
    const hasConditions =
      groupRestrict && groupRestrict.cond && groupRestrict.cond.length > 0;
    const isExpanded = expandedConditions.has(`group-${group.id}`);

    const handleToggleConditions = (e) => {
      e.stopPropagation();
      const newExpanded = new Set(expandedConditions);
      const groupKey = `group-${group.id}`;
      if (isExpanded) {
        newExpanded.delete(groupKey);
      } else {
        newExpanded.add(groupKey);
      }
      setExpandedConditions(newExpanded);
    };

    // Transform restrict format to match expected format
    const groupConditions = hasConditions
      ? {
          cond_fields: groupRestrict.cond.map((c) => ({ ...c })),
          cond_operator: groupRestrict.op,
        }
      : null;

    const groupContent = (
      <div
        className={`border border-2 ${isNew ? 'border-info' : 'border-secondary'} rounded p-2 mb-2`}
      >
        <div className="d-flex align-items-center mb-2">
          <Badge bg={isNew ? 'info' : 'secondary'} className="me-2">
            {FIcons.faLayerGroup}
          </Badge>
          <strong className={isNew ? 'text-info' : ''}>{group.label}</strong>
          {/* <span className="ms-auto text-muted small">
            (pos: {group.position})
          </span> */}
          {hasConditions && (
            <Button
              variant="outline-secondary"
              size="xsm"
              onClick={handleToggleConditions}
              className="ms-2"
            >
              {FIcons.faGears} {isExpanded ? 'Hide' : 'Show'} Restrictions
            </Button>
          )}
        </div>
        {hasConditions && isExpanded && groupConditions && (
          <div className="mb-2">
            <ConditionView conditions={groupConditions} layers={layers} />
          </div>
        )}
        <div>
          {sortedGroupLayers.map((layer) =>
            renderLayer(layer, isNew, group.id),
          )}
          {sortedGroupLayers.length === 0 && (
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
          return (
            <div
              key={`layer-${item.data.key}-current`}
              className="w-100 p-2 m-2"
            >
              {renderLayer(item.data, false, null)}
            </div>
          );
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
          <LHText title="Current Arrangement">
            The existing arrangement of groups and layers
          </LHText>
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

GroupLayerOrderContent.displayName = 'GroupLayerOrderContent';

export default GroupLayerOrderContent;
