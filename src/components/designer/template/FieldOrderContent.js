import React, { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import sortBy from 'lodash/sortBy';
import { FieldTypes, moveField } from 'generic-ui-core';
import DragLayer from '@components/dnd/DragLayer';
import DnD from '@components/dnd/DnD';
import DnDs from '@components/dnd/DnDs';
import FIcons from '@components/icons/FIcons';
import FieldConditionsDisplay from '@components/designer/template/ConditionsDisplay';
import { LHText } from '@components/shared/LCom';
import { defaultFieldsContent, definedFieldHeader } from '@components/shared/arrangeUtils';

const FieldOrderContent = forwardRef(({ layer }, ref) => {
  // Initialize state with empty object or layers
  const fields = layer?.fields || [];
  // Initialize state with the original layers
  const [newFields, setNewFields] = useState(fields);

  // Create ref for scrollable container
  const scrollableContainerRef = useRef(null);

  // Expose method to get current newFields value
  useImperativeHandle(ref, () => ({
    getUpdates: () => newFields,
  }));

  if (fields.length === 0) return defaultFieldsContent;

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
        {definedFieldHeader(label, field, FieldTypes.F_DUMMY === type ? 'dummy' : type)}
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
      <DragLayer scrollableContainerRef={scrollableContainerRef} />
    </div>
  );
});

FieldOrderContent.displayName = 'FieldOrderContent';

export default FieldOrderContent;
