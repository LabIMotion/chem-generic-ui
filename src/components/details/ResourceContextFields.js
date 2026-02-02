import React from 'react';
import PropTypes from 'prop-types';
import { Form, Accordion } from 'react-bootstrap';
import { bgColor } from '@components/tools/format-utils';
import { renderIdentifierField } from '@/components/details/ElementDetailsIdentifier';
import { useGenInterfaceContext } from '@components/details/GenInterfaceContext';

function ResourceContextFields() {
  const { refSource } = useGenInterfaceContext();
  const element = refSource?.element;
  // Only show for samples with resource context data
  const resources = element?.tag?.taggable_data?.resources;
  const elementType = element?.type?.toLowerCase();

  // Don't render if not a sample or no resources
  if (elementType !== 'sample' || !resources || !Array.isArray(resources) || resources.length === 0) {
    return null;
  }

  // Fixed fields for resource context
  const fields = [
    {
      key: 'resource_context_id',
      label: 'Resource Context ID',
    },
    {
      key: 'resource_context_type',
      label: 'Resource Context Type',
    },
    {
      key: 'resource_context_label',
      label: 'Resource Context Label',
    },
    {
      key: 'resource_context_identifier',
      label: 'Resource Context Identifier',
    }
  ];

  // Helper function to get field value from resources
  const getFieldValue = (fieldKey) => {
    return resources[0]?.[fieldKey] || '';
  };

  // Group fields into a single row of 4
  const row = fields;

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
            Contextual Information/Origin of the sample
          </span>
        </Accordion.Header>
        <Accordion.Body className="py-0">
          <div className="container-fluid" style={{ paddingTop: '6px' }}>
            <div className="row mb-3">
              {row.map((field) => (
                <div className="col-md-3" key={field.key}>
                  <Form.Label>
                    {field.label}
                  </Form.Label>
                  {field.key === 'resource_context_identifier' ? (
                    renderIdentifierField(field, element)
                  ) : (
                    <Form.Control
                      type="text"
                      value={getFieldValue(field.key)}
                      readOnly
                      style={{ backgroundColor: '#f5f5f5' }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

ResourceContextFields.propTypes = {};

ResourceContextFields.defaultProps = {};

export default ResourceContextFields;
