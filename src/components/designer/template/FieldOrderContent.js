import React, { forwardRef, useImperativeHandle, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import sortBy from 'lodash/sortBy';
import { FieldTypes, moveField } from 'generic-ui-core';
import DnD from '../../dnd/DnD';
import DnDs from '../../dnd/DnDs';
import FIcons from '../../icons/FIcons';
import FieldConditionsDisplay from './ConditionsDisplay';
import { LHText } from '../../shared/LCom';

const defaultContent = <h1>No fields to arrange</h1>;
const definedHeader = (label, field, type) => {
  const isDummy = FieldTypes.F_DUMMY === type;
  const content = isDummy ? '(dummy field)' : `${label}(${field})`;
  return (
    <span className="fw-bold d-flex justify-content-between align-items-center">
      {content}
    </span>
  );
};

const FieldOrderContent = forwardRef(({ layer }, ref) => {
  // Initialize state with empty object or layers
  const fields = layer?.fields || [];
  // Initialize state with the original layers
  const [newFields, setNewFields] = useState(fields);

  // Expose method to get current newFields value
  useImperativeHandle(ref, () => ({
    getUpdates: () => newFields,
  }));

  if (fields.length === 0) return defaultContent;

  const handleMove = (sourceKey, targetKey) => {
    const updatedFields = moveField(newFields, sourceKey, targetKey);
    setNewFields(updatedFields);
  };

  // Use different source for current and new arrangements
  const currentSortedFields = sortBy(fields, ['position']) || [];
  const newSortedFields = sortBy(newFields, ['position']) || [];

  const block = (obj, isNew = false) => {
    const { label, field, type } = obj;

    const contentStyle = `p-3 rounded border border-${
      isNew ? 'primary' : 'secondary'
    } `;

    const content = (
      <div className={contentStyle}>
        {definedHeader(label, field, type)}
        <FieldConditionsDisplay conditions={obj} />
      </div>
    );

    // If it's current view or workflow layer, return non-draggable content
    if (!isNew) {
      return (
        <div
          key={`${field}-${isNew ? 'new' : 'current'}`}
          className="w-100 p-2 m-2"
        >
          <div>{content}</div>
        </div>
      );
    }

    return (
      <DnD
        key={`${field}-${isNew ? 'new' : 'current'}`}
        type={DnDs.LAYER_FIELD}
        layer={{ key: obj.field, ...obj }}
        field="position"
        handleMove={handleMove}
        canDrag
      >
        {content}
      </DnD>
    );
  };

  const fieldsListCurrent = currentSortedFields
    .map((field) => block(field, false))
    .filter(Boolean);
  const fieldsListNew = newSortedFields
    .map((field) => block(field, true))
    .filter(Boolean);

  return (
    <div className="d-flex flex-column h-100">
      <Row className="mx-0 p-3">
        <Col md={6}>
          <LHText title="Current Arrangement">The existing arrangement</LHText>
        </Col>
        <Col md={6} className="text-primary">
          <LHText title="New Arrangement">
            Drag and drop ({FIcons.faArrowsUpDownLeftRight}) to reorder fields
          </LHText>
        </Col>
      </Row>
      <div
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
            {fieldsListCurrent}
          </Col>
          <Col
            md={6}
            style={{
              position: 'relative',
            }}
          >
            {fieldsListNew}
          </Col>
        </Row>
      </div>
    </div>
  );
});

FieldOrderContent.displayName = 'FieldOrderContent';

export default FieldOrderContent;
