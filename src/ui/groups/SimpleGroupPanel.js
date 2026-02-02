import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';
import useRestrictionForm from '@ui/groups/useRestrictionForm';
import RestrictionFormCard from '@ui/groups/RestrictionFormCard';
import SimpleLayerBlock from '@ui/groups/SimpleLayerBlock';

/**
 * SimpleGroupPanel - Simple display component for a group of layers
 */
function SimpleGroupPanel({
  groupId,
  groupLabel,
  groupPosition,
  layers,
  renderLayer,
  onRemove,
  onRemoveLayerFromGroup,
  onUpdateRestriction,
  restriction,
  availableLayers,
  onUpdateLayerRestriction,
  groupLayers,
  selectOptions,
}) {
  const {
    showRestrictionForm,
    setShowRestrictionForm,
    conditions,
    selectedLayer,
    selectedField,
    fieldValue,
    setFieldValue,
    availableFields,
    selectedOp,
    handleRestrictionClick,
    handleLayerChange,
    handleFieldChange,
    handleAddCondition,
    handleRemoveCondition,
    handleOpChange,
    selectedSource,
    handleSourceChange,
  } = useRestrictionForm({
    entityKey: groupId,
    restriction,
    availableLayers,
    onUpdateRestriction,
    idSuffix: 'gc',
    filterCurrentLayer: false,
  });

  const handleRemoveGroup = () => {
    if (onRemove) {
      onRemove(groupId);
    }
  };

  return (
    <Card className="mb-3 border border-primary border-2">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span className="panel_generic_heading">
          <span>{FIcons.faLayerGroup}</span>
          {groupLabel || groupId}
          {/* {groupPosition !== undefined && (
            <span className="text-muted small ms-2 fw-normal">
              Position: {groupPosition}
            </span>
          )} */}
        </span>
        <div className="d-flex gap-2">
          {onUpdateRestriction && (
            <Button
              variant="primary"
              size="xsm"
              onClick={handleRestrictionClick}
              title="Manage restrictions"
            >
              <span>{FIcons.faGears}</span> {conditions.length > 0 && `(${conditions.length})`}
            </Button>
          )}
          {onRemove && (
            <Button
              variant="danger"
              size="xsm"
              onClick={handleRemoveGroup}
              title="Remove this group"
            >
              {FIcons.faTrashCan}
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body className="py-3 px-2 bg-light">
        {showRestrictionForm && (
          <RestrictionFormCard
            conditions={conditions}
            selectedLayer={selectedLayer}
            selectedField={selectedField}
            fieldValue={fieldValue}
            availableFields={availableFields}
            selectedOp={selectedOp}
            availableLayers={availableLayers}
            selectOptions={selectOptions}
            filterCurrentLayer={false}
            currentEntityKey={groupId}
            onClose={() => setShowRestrictionForm(false)}
            onLayerChange={handleLayerChange}
            onFieldChange={handleFieldChange}
            onValueChange={(e) => setFieldValue(e.target.value)}
            onAddCondition={handleAddCondition}
            onRemoveCondition={handleRemoveCondition}
            onOpChange={handleOpChange}
            selectedSource={selectedSource}
            onSourceChange={handleSourceChange}
          />
        )}

        {layers &&
          layers.map((layer) => (
            <SimpleLayerBlock
              key={layer.key}
              layerKey={layer.key}
              layerData={layer.data}
              onRemoveFromGroup={onRemoveLayerFromGroup}
              groupId={groupId}
              onUpdateRestriction={onUpdateLayerRestriction}
              restriction={
                layer.data.cond_fields
                  ? {
                      op: layer.data.cond_operator ?? 1,
                      cond: layer.data.cond_fields,
                    }
                  : null
              }
              availableLayers={groupLayers}
              selectOptions={selectOptions}
            >
              {renderLayer ? renderLayer(layer) : null}
            </SimpleLayerBlock>
          ))}
      </Card.Body>
    </Card>
  );
}

SimpleGroupPanel.propTypes = {
  groupId: PropTypes.string.isRequired,
  groupLabel: PropTypes.string.isRequired,
  groupPosition: PropTypes.number,
  layers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      position: PropTypes.number,
      data: PropTypes.shape({}).isRequired,
    }),
  ).isRequired,
  renderLayer: PropTypes.func.isRequired,
  onRemove: PropTypes.func,
  onRemoveLayerFromGroup: PropTypes.func,
  onUpdateRestriction: PropTypes.func,
  restriction: PropTypes.shape({
    op: PropTypes.number,
    cond: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        field: PropTypes.string,
        layer: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
      }),
    ),
  }),
  availableLayers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      fields: PropTypes.arrayOf(PropTypes.object),
    }),
  ),
  onUpdateLayerRestriction: PropTypes.func,
  groupLayers: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string,
      fields: PropTypes.arrayOf(PropTypes.object),
    }),
  ),
  selectOptions: PropTypes.object,
};

SimpleGroupPanel.defaultProps = {
  groupPosition: null,
  onRemove: null,
  onRemoveLayerFromGroup: null,
  onUpdateRestriction: null,
  restriction: null,
  availableLayers: [],
  onUpdateLayerRestriction: null,
  groupLayers: [],
  selectOptions: {},
};

export default SimpleGroupPanel;
