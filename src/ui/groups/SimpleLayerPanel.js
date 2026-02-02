import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Form } from 'react-bootstrap';
import orderBy from 'lodash/orderBy';
import FIcons from '@components/icons/FIcons';
import LBadge from '@components/shared/LBadge';
import { bgColor } from '@components/tools/format-utils';
import useRestrictionForm from '@ui/groups/useRestrictionForm';
import RestrictionFormCard from '@ui/groups/RestrictionFormCard';

const ASSIGN_EXISTING = 'existing';
const ASSIGN_NEW = 'new';

/**
 * SimpleLayerPanel - Simple display component for an individual ungrouped layer
 */
function SimpleLayerPanel({
  layerKey,
  layerData,
  children,
  onAssignToGroup,
  existingGroups,
  onUpdateRestriction,
  restriction,
  availableLayers,
  selectOptions,
}) {
  const { label, style } = layerData;
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [groupAction, setGroupAction] = useState(ASSIGN_EXISTING); // ASSIGN_EXISTING or ASSIGN_NEW
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [newGroupLabel, setNewGroupLabel] = useState('');
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
    entityKey: layerKey,
    restriction,
    availableLayers,
    onUpdateRestriction,
    idSuffix: 'lc',
    filterCurrentLayer: true,
  });

  const handleAssignClick = () => {
    setShowAssignForm(!showAssignForm);
    if (!showAssignForm) {
      // Reset form when opening
      setGroupAction(ASSIGN_EXISTING);
      const sortedGroups = orderBy(
        existingGroups || [],
        [(g) => g.label.toLowerCase()],
        ['asc'],
      );
      setSelectedGroupId(sortedGroups.length > 0 ? sortedGroups[0].id : '');
      setNewGroupLabel('');
    }
  };

  const handleSubmit = () => {
    if (onAssignToGroup) {
      if (groupAction === ASSIGN_EXISTING) {
        if (selectedGroupId) {
          onAssignToGroup(layerKey, selectedGroupId, null);
          setShowAssignForm(false);
        }
      } else if (groupAction === ASSIGN_NEW) {
        if (newGroupLabel.trim()) {
          onAssignToGroup(layerKey, null, newGroupLabel.trim());
          setShowAssignForm(false);
        }
      }
    }
  };

  return (
    <Card className="mb-3 border">
      <Card.Header
        className={`${bgColor()} d-flex justify-content-between align-items-center`}
      >
        <span className={style || 'panel_generic_heading'}>
          {label || layerKey}
        </span>
        <div className="d-flex gap-2">
          {layerData.wf && (
            <LBadge variant="outline" color="warning" text="workflow" />
          )}
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
          {onAssignToGroup && (
            <span
              title={
                layerData.wf
                  ? 'A workflow layer cannot be assigned to a group'
                  : 'Assign this layer to a group'
              }
              style={layerData.wf ? { cursor: 'not-allowed' } : {}}
            >
              <Button
                variant={showAssignForm ? 'light' : 'primary'}
                size="xsm"
                onClick={handleAssignClick}
                disabled={layerData.wf}
                style={layerData.wf ? { pointerEvents: 'none' } : {}}
              >
                {showAssignForm ? 'Close' : (
                  <>
                    {FIcons.faLayerGroup} Assign to a group
                  </>
                )}
              </Button>
            </span>
          )}
        </div>
      </Card.Header>
      <Card.Body className="py-2 px-3">
        {children}
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
            selectedSource={selectedSource}
            onSourceChange={handleSourceChange}
          />
        )}
        {onAssignToGroup && showAssignForm && (
          <div className="mt-3 p-3 border rounded bg-light">
            <div className="row align-items-start">
              <div className="col-md-5">
                <Form.Group>
                  <Form.Check
                    type="radio"
                    id={`${layerKey}-new`}
                    label="Create new group"
                    checked={groupAction === ASSIGN_NEW}
                    onChange={() => setGroupAction(ASSIGN_NEW)}
                  />
                  {groupAction === ASSIGN_NEW && (
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="Enter group name"
                      className="mt-2"
                      value={newGroupLabel}
                      onChange={(e) => setNewGroupLabel(e.target.value)}
                    />
                  )}
                </Form.Group>
              </div>
              <div className="col-md-5">
                <Form.Group>
                  <Form.Check
                    type="radio"
                    id={`${layerKey}-existing`}
                    label="Add to existing group"
                    checked={groupAction === ASSIGN_EXISTING}
                    onChange={() => setGroupAction(ASSIGN_EXISTING)}
                  />
                  {groupAction === ASSIGN_EXISTING &&
                    existingGroups &&
                    existingGroups.length > 0 && (
                      <Form.Select
                        size="sm"
                        className="mt-2"
                        value={selectedGroupId}
                        onChange={(e) => setSelectedGroupId(e.target.value)}
                      >
                        {orderBy(
                          existingGroups,
                          [(g) => g.label.toLowerCase()],
                          ['asc'],
                        ).map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.label}
                          </option>
                        ))}
                      </Form.Select>
                    )}
                  {groupAction === ASSIGN_EXISTING &&
                    (!existingGroups || existingGroups.length === 0) && (
                      <div className="text-muted small mt-2">
                        No existing groups available
                      </div>
                    )}
                </Form.Group>
              </div>
              <div className="col-md-2 text-end">
                <Button
                  variant="primary"
                  size="xsm"
                  onClick={handleSubmit}
                  disabled={
                    (groupAction === ASSIGN_EXISTING && !selectedGroupId) ||
                    (groupAction === ASSIGN_NEW && !newGroupLabel.trim())
                  }
                >
                  Assign
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

SimpleLayerPanel.propTypes = {
  layerKey: PropTypes.string.isRequired,
  layerData: PropTypes.shape({
    label: PropTypes.string,
    color: PropTypes.string,
    style: PropTypes.string,
    wf: PropTypes.bool,
  }).isRequired,
  children: PropTypes.node.isRequired,
  onAssignToGroup: PropTypes.func.isRequired,
  existingGroups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
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

SimpleLayerPanel.defaultProps = {
  existingGroups: [],
  onUpdateRestriction: null,
  restriction: null,
  availableLayers: [],
  selectOptions: {},
};

export default SimpleLayerPanel;
