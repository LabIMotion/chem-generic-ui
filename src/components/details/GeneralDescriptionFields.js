import React from 'react';
import PropTypes from 'prop-types';
import { Form, Accordion } from 'react-bootstrap';
import { userData } from '@components/tools/utils';
import { bgColor } from '@components/tools/format-utils';
import { useGenInterfaceContext } from '@components/details/GenInterfaceContext';

function GeneralDescriptionFields({
  disabled, readOnly
}) {
  const { refSource } = useGenInterfaceContext();
  const datasetContainer = refSource?.datasetContainer;
  const currentUser = refSource?.currentUser;
  const onChange = refSource?.fnRef;
  // Get general description data from extended_metadata
  const generalDescription = datasetContainer?.extended_metadata?.general_description || {};

  // Get creator name from current user
  const creatorName = userData(currentUser).name || '';

  // Helper function to handle field changes
  const handleFieldChange = (fieldName, value) => {
    if (onChange) {
      const updatedContainer = { ...datasetContainer };
      if (!updatedContainer.extended_metadata) {
        updatedContainer.extended_metadata = {};
      }
      if (!updatedContainer.extended_metadata.general_description) {
        updatedContainer.extended_metadata.general_description = {};
      }
      updatedContainer.extended_metadata.general_description[fieldName] = value;
      onChange(updatedContainer);
    }
  };

  // Helper function to get field value
  const getFieldValue = (fieldName) => {
    if (fieldName === 'creator') {
      return generalDescription[fieldName] || creatorName;
    }
    return generalDescription[fieldName] || '';
  };

  // Define fields with their configurations
  const fields = [
    {
      key: 'title', label: 'Title', type: 'text', placeholder: 'Enter title', readOnly: false
    },
    {
      key: 'date', label: 'Date', type: 'text', placeholder: '', readOnly: false
    },
    {
      key: 'time', label: 'Time', type: 'text', placeholder: '', readOnly: false
    },
    {
      key: 'contributor', label: 'Contributor', type: 'text', placeholder: 'Enter contributor name', readOnly: false
    },
    {
      key: 'creator', label: 'Creator', type: 'text', placeholder: '', readOnly: true
    },
    {
      key: 'operator', label: 'Operator', type: 'text', placeholder: 'Enter operator name', readOnly: false
    },
  ];

  // Group fields into rows of 3
  const rows = [];
  for (let i = 0; i < fields.length; i += 3) {
    rows.push(fields.slice(i, i + 3));
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
          <span className="panel_generic_heading" style={{ pointerEvents: 'none' }}>General description</span>
        </Accordion.Header>
        <Accordion.Body className="py-0">
          <div className="container-fluid">
            {rows.map((row, index) => (
              <div className={`row ${index === 0 ? 'mt-1' : ''} mb-3`} key={row.map((f) => f.key).join('-')}>
                {row.map((field) => (
                  <div className="col-md-4" key={field.key}>
                    <Form.Label>{field.label}</Form.Label>
                    <Form.Control
                      type={field.type}
                      value={getFieldValue(field.key)}
                      placeholder={field.placeholder}
                      disabled={readOnly || disabled || field.readOnly}
                      readOnly={field.readOnly}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      style={field.readOnly ? { backgroundColor: '#f5f5f5' } : {}}
                    />
                  </div>
                ))}
                {/* Fill remaining columns if less than 3 fields in the last row */}
                {row.length < 3 && Array.from({ length: 3 - row.length }).map((__, emptyIdx) => (
                  <div className="col-md-4" key={`empty-col-${row[0].key}-pos${emptyIdx + row.length}`} />
                ))}
              </div>
            ))}
          </div>
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
}

GeneralDescriptionFields.propTypes = {
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
};

GeneralDescriptionFields.defaultProps = {
  datasetContainer: {},
  currentUser: {},
  disabled: false,
  readOnly: false,
};

export default GeneralDescriptionFields;
