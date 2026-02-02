import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';
import { bgColor } from '@components/tools/format-utils';
import useRestrictionForm from '@ui/groups/useRestrictionForm';
import RestrictionFormCard from '@ui/groups/RestrictionFormCard';

/**
 * SimpleLayerBlock - Simple display component for a layer within a group
 */
function SimpleLayerBlock({
  layerKey,
  layerData,
  children,
  onRemoveFromGroup,
  groupId,
  onUpdateRestriction,
  restriction,
  availableLayers,
  selectOptions,
}) {
  const { label, color, style } = layerData;
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
  } = useRestrictionForm({
    entityKey: layerKey,
    restriction,
    availableLayers,
    onUpdateRestriction,
    idSuffix: 'lc',
    filterCurrentLayer: true,
  });

  const handleRemove = () => {
    if (onRemoveFromGroup && groupId) {
      onRemoveFromGroup(groupId, layerKey);
    }
  };

  return (
    <Card className="mb-2 border border-secondary">
      <Card.Header
        className={`fs-6 ${bgColor()} d-flex justify-content-between align-items-center`}
      >
        <span className={style || 'panel_generic_subheading'}>
          {label || layerKey}
        </span>
        <div className="d-flex gap-2">
          {onUpdateRestriction && (
            <span
              title={
                layerData.wf
                  ? 'Restrictions cannot be set on workflow layers'
                  : 'Manage restrictions'
              }
              style={layerData.wf ? { cursor: 'not-allowed' } : {}}
            >
              <Button
                variant="primary"
                size="xsm"
                onClick={handleRestrictionClick}
                disabled={layerData.wf}
                style={layerData.wf ? { pointerEvents: 'none' } : {}}
              >
                <span>{FIcons.faGears}</span> {conditions.length > 0 && `(${conditions.length})`}
              </Button>
            </span>
          )}
          {onRemoveFromGroup && (
            <Button
              variant="danger"
              size="xsm"
              onClick={handleRemove}
              title="Remove from group"
            >
              {FIcons.faTrashCan}
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body className="py-2 px-3">
        {onUpdateRestriction && showRestrictionForm && !layerData.wf && (
          <RestrictionFormCard
            conditions={conditions}
            selectedLayer={selectedLayer}
            selectedField={selectedField}
            fieldValue={fieldValue}
            availableFields={availableFields}
            selectedOp={selectedOp}
            availableLayers={availableLayers}
            selectOptions={selectOptions}
            filterCurrentLayer
            currentEntityKey={layerKey}
            onClose={() => setShowRestrictionForm(false)}
            onLayerChange={handleLayerChange}
            onFieldChange={handleFieldChange}
            onValueChange={(e) => setFieldValue(e.target.value)}
            onAddCondition={handleAddCondition}
            onRemoveCondition={handleRemoveCondition}
            onOpChange={handleOpChange}
          />
        )}
        {children}
      </Card.Body>
    </Card>
  );
}

SimpleLayerBlock.propTypes = {
  layerKey: PropTypes.string.isRequired,
  layerData: PropTypes.shape({
    label: PropTypes.string,
    color: PropTypes.string,
    style: PropTypes.string,
    wf: PropTypes.bool,
  }).isRequired,
  children: PropTypes.node.isRequired,
  onRemoveFromGroup: PropTypes.func,
  groupId: PropTypes.string,
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
  selectOptions: PropTypes.object,
};

SimpleLayerBlock.defaultProps = {
  onRemoveFromGroup: null,
  groupId: null,
  onUpdateRestriction: null,
  restriction: null,
  availableLayers: [],
  selectOptions: {},
};

export default SimpleLayerBlock;
