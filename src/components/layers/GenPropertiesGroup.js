/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Badge, Collapse } from 'react-bootstrap';
import GenPropertiesLayer from '@components/layers/GenPropertiesLayer';
import FIcons from '@components/icons/FIcons';
import ConditionView from '@components/designer/template/ConditionView';
import { isItemEffectivelyVisible } from '@utils/template/visibility-handler';
import { useGenInterfaceContext } from '@components/details/GenInterfaceContext';
import { isFirstLayer } from '@components/details/handler';

/**
 * Renders a group of layers with optional restrictions
 */
function GenPropertiesGroup({
  groupId,
  groupLabel,
  groupLayers,
  restriction,
  allLayers,
  id,
  classStr,
  onChange,
  onSubChange,
  selectOptions,
  onClick,
  isPreview,
  isSearch,
  activeWF,
  onNavi,
  isSpCall,
  hasAi,
  aiComp,
  expandAll,
  editMode,
  genericType,
  groups,
}) {
  const { refSource } = useGenInterfaceContext();
  const [isInitialExpansion, setIsInitialExpansion] = useState(true);
  const [expanded, setExpanded] = useState(() => {
    if (expandAll != null) {
      return expandAll;
    }
    // Check if any layer in the group is the first layer
    const hasFirstLayer = (groupLayers || []).some((layer) =>
      isFirstLayer(allLayers, layer.key, groups),
    );
    return hasFirstLayer;
  });
  const [showRestrictions, setShowRestrictions] = useState(false);

  const hasRestrictions =
    restriction && restriction.cond && restriction.cond.length > 0;

  // Transform restriction format if needed
  const transformedRestriction = hasRestrictions
    ? {
        cond_fields: restriction.cond.map((c) => ({
          ...c,
          value: c.eq || c.value,
        })),
        cond_operator: restriction.op,
      }
    : null;

  // Sort layers by position within the group (use array order from metadata)
  const sortedLayers = groupLayers || [];

  // Determine effective expandAll for child layers
  let effectiveExpandAll = expandAll;
  if (effectiveExpandAll === undefined) {
    if (!isInitialExpansion) {
      effectiveExpandAll = false;
    }
  }

  // Render layers considering their conditions
  const layerElements = sortedLayers
    .map((layer, idx) => {
      const uk = `${groupId}_${layer.key}_${idx}`;

      // Check if layer should be shown based on its conditions
      if (
        typeof layer.cond_fields === 'undefined' ||
        layer.cond_fields == null ||
        layer.cond_fields.length === 0
      ) {
        return (
          <GenPropertiesLayer
            id={id}
            key={uk}
            layer={layer}
            classStr={classStr || ''}
            onChange={onChange}
            onSubChange={onSubChange}
            selectOptions={selectOptions}
            onClick={onClick}
            layers={allLayers}
            isPreview={isPreview}
            isSearch={isSearch}
            activeWF={activeWF}
            onNavi={onNavi}
            isSpCall={isSpCall}
            hasAi={hasAi}
            aiComp={aiComp}
            expandAll={effectiveExpandAll}
            editMode={editMode}
            genericType={genericType}
            grouped
            groups={groups}
          />
        );
      }

      // Layer has conditions, check if it should be shown
      const [showLayer] = isItemEffectivelyVisible(layer, allLayers, refSource?.element);
      if (showLayer) {
        return (
          <GenPropertiesLayer
            id={id}
            key={uk}
            layer={layer}
            classStr={classStr || ''}
            onChange={onChange}
            onSubChange={onSubChange}
            selectOptions={selectOptions}
            onClick={onClick}
            layers={allLayers}
            isPreview={isPreview}
            isSearch={isSearch}
            activeWF={activeWF}
            onNavi={onNavi}
            isSpCall={isSpCall}
            hasAi={hasAi}
            aiComp={aiComp}
            expandAll={effectiveExpandAll}
            editMode={editMode}
            genericType={genericType}
            grouped
            groups={groups}
          />
        );
      }

      return null;
    })
    .filter(Boolean);

  return (
    <Card className="mb-3 border-2 border-info" id={`group-anchor-${groupId}`}>
      <Card.Header
        className="d-flex align-items-center justify-content-between cursor-pointer"
        onClick={() => {
          setExpanded(!expanded);
          setIsInitialExpansion(false);
        }}
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex align-items-center">
          <Badge bg="info" className="me-2">
            {FIcons.faLayerGroup}
          </Badge>
          <strong className="text-info">{groupLabel}</strong>
          <span className="ms-2 text-muted small">
            ({groupLayers.length} layer{groupLayers.length !== 1 ? 's' : ''})
          </span>
        </div>
        <div className="d-flex align-items-center">
          {hasRestrictions && (
            <Badge
              bg="secondary"
              className="me-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowRestrictions(!showRestrictions);
              }}
              style={{ cursor: 'pointer' }}
            >
              {FIcons.faGears} {showRestrictions ? 'Hide' : 'Show'} Restrictions
            </Badge>
          )}
          <span className="text-muted">
            {expanded ? FIcons.faChevronUp : FIcons.faChevronDown}
          </span>
        </div>
      </Card.Header>
      {showRestrictions && hasRestrictions && transformedRestriction && (
        <Card.Body className="border-bottom bg-light py-2">
          <ConditionView
            conditions={transformedRestriction}
            layers={allLayers}
          />
        </Card.Body>
      )}
      <Collapse in={expanded} unmountOnExit>
        <Card.Body className="p-2">
          {layerElements.length > 0 ? (
            layerElements
          ) : (
            <div className="text-muted text-center py-3">
              No layers to display in this group
            </div>
          )}
        </Card.Body>
      </Collapse>
    </Card>
  );
}

GenPropertiesGroup.propTypes = {
  groupId: PropTypes.string.isRequired,
  groupLabel: PropTypes.string.isRequired,
  groupLayers: PropTypes.array.isRequired,
  restriction: PropTypes.object,
  allLayers: PropTypes.object.isRequired,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  classStr: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onSubChange: PropTypes.func.isRequired,
  selectOptions: PropTypes.object,
  onClick: PropTypes.func,
  isPreview: PropTypes.bool,
  isSearch: PropTypes.bool,
  activeWF: PropTypes.bool,
  onNavi: PropTypes.func,
  isSpCall: PropTypes.bool,
  hasAi: PropTypes.bool,
  aiComp: PropTypes.object,
  expandAll: PropTypes.bool,
  editMode: PropTypes.bool,
  genericType: PropTypes.string,
  groups: PropTypes.array,
};

GenPropertiesGroup.defaultProps = {
  groups: [],
};

export default GenPropertiesGroup;
