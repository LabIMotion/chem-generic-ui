import React from 'react';
import PropTypes from 'prop-types';
import { Form, Accordion } from 'react-bootstrap';
import { bgColor } from '@components/tools/format-utils';
import elementFieldsMapping from '@utils/json/element-fields-mapping.json';
import { renderIdentifierField } from '@/components/details/ElementDetailsIdentifier';
import { useGenInterfaceContext } from '@components/details/GenInterfaceContext';

function ElementDetailsFields() {
  const { refSource } = useGenInterfaceContext();
  const element = refSource?.element;
  let elementType = element?.type?.toLowerCase() || 'default';

  if (element?.klassType === 'GenericEl') {
    elementType = element?.element_klass?.label || 'default';
  }

  // Helper function to resolve field reference to full field object
  const resolveField = (fieldRef) => {
    if (typeof fieldRef === 'string') {
      return elementFieldsMapping.baseFields.find((f) => f.key === fieldRef);
    }
    return fieldRef;
  };

  const rawFieldMapping = elementFieldsMapping[elementType] || elementFieldsMapping.default;
  const fieldMapping = rawFieldMapping.map(resolveField).filter((f) => f !== undefined);

  // Get element type label
  const elementTypeLabel = elementType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Helper function to get field value
  const getFieldValue = (field) => {
    const { key, additionalKey, source } = field;

    // Handle system-sourced fields
    if (source === 'system') {
      if (key === 'current_datetime') {
        return new Date().toLocaleString();
      }
      return '';
    }

    // Handle element-sourced fields
    if (key === 'type' && elementType) {
      return `${elementType} analysis`;
    }

    // Handle element-sourced fields
    if (key === 'rxno') {
      return element?.rxno?.split('|')?.pop().trim();
    }

    // Handle compound fields (e.g., amount_value + amount_unit)
    if (additionalKey) {
      const mainValue = element?.[key] || '';
      const additionalValue = element?.[additionalKey] || '';
      return additionalValue ? `${mainValue} ${additionalValue}` : mainValue;
    }

    return element?.[key] || '';
  };

  // Helper function to get field label
  const getFieldLabel = (key, label) => {
    if (key === 'type') {
      return 'Type of the data';
    }
    return `${elementTypeLabel} ${label}`;
  };

  // Group fields into rows of 4
  const rows = [];
  for (let i = 0; i < fieldMapping.length; i += 4) {
    rows.push(fieldMapping.slice(i, i + 4));
  }

  return (
    <Accordion
      defaultActiveKey="0"
      className="mb-4"
    >
      <Accordion.Item eventKey="0" style={{ border: 'none' }}>
        <Accordion.Header
          as="div"
          className={`lu-ds-element-accordion-header flex-grow-1 ${bgColor()}`}
          style={{ boxShadow: 'none' }}
        >
          <span className="panel_generic_heading" style={{ pointerEvents: 'none' }}>
            Source details:
            {' '}
            {elementTypeLabel}
          </span>
        </Accordion.Header>
        <Accordion.Body className="py-0">
          <div className="container-fluid" style={{ paddingTop: '6px' }}>
            {rows.map((row) => (
              <div className="row mb-3" key={row.map((f) => f.key).join('-')}>
                {row.map((field) => (
                  <div className="col-md-3" key={field.key}>
                    <Form.Label title={field.hover_text || ''}>
                      {getFieldLabel(field.key, field.label)}
                    </Form.Label>
                    {field.key === 'resource_identifier' ? (
                      renderIdentifierField(field, element)
                    ) : (
                      <Form.Control
                        type="text"
                        value={getFieldValue(field)}
                        readOnly
                        style={{ backgroundColor: '#f5f5f5' }}
                      />
                    )}
                  </div>
                ))}
                {/* Fill remaining columns if less than 4 fields in the last row */}
                {row.length < 4 && Array.from({ length: 4 - row.length }).map((__, emptyIdx) => (
                  <div className="col-md-3" key={`empty-col-${row[0].key}-pos${emptyIdx + row.length}`} />
                ))}
              </div>
            ))}
          </div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

ElementDetailsFields.propTypes = {};

ElementDetailsFields.defaultProps = {};

export default ElementDetailsFields;
