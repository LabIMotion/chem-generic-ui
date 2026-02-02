import React, { useState } from 'react';
import ButtonTooltip from '@components/fields/ButtonTooltip';
import { Modal, Button } from 'react-bootstrap';
import Constants from '@components/tools/Constants';

const InfoRenderer = ({ data, node, genericType }) => {
  const [show, setShow] = useState(false);

  const onShow = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  // Determine the custom field based on genericType
  const getCustomField = () => {
    if (genericType === Constants.GENERIC_TYPES.DATASET) {
      return {
        label: 'Term ID:',
        value: data?.ols_term_id || 'N/A',
        column: 'left'
      };
    } else {
      return {
        label: 'Description:',
        value: data?.desc || 'N/A',
        column: 'left'
      };
    }
  };

  const defaultFields = [
    {
      label: `${genericType}:`,
      value: data?.label || 'N/A',
      column: 'left'
    },
    getCustomField(),
    {
      label: 'Version:',
      value: data?.version || 'N/A',
      column: 'left'
    },
    {
      label: 'UUID:',
      value: data?.uuid || 'N/A',
      column: 'left',
      isCode: true
    },
    {
      label: 'Released At:',
      value: data?.released_at || 'N/A',
      column: 'right'
    },
    {
      label: 'Updated At:',
      value: data?.updated_at || 'N/A',
      column: 'right'
    },
    {
      label: 'Sync Time:',
      value: data?.sync_time || 'N/A',
      column: 'right'
    },
    {
      label: 'Identifier:',
      value: data?.identifier || 'N/A',
      column: 'right',
      isCode: true
    }
  ];

  const leftFields = defaultFields.filter(field => field.column === 'left');
  const rightFields = defaultFields.filter(field => field.column === 'right');

  const renderField = (field, index) => (
    <div key={index} className="mb-3">
      <strong className="text-muted">{field.label}</strong>
      <div className="mt-1">
        {field.isCode ? (
          <code className="small">{field.value}</code>
        ) : (
          field.value
        )}
      </div>
    </div>
  );

  return (
    <>
      <span className="d-inline-flex align-items-center gap-1">
        <ButtonTooltip
          idf="tpl_ver_info"
          fa="faTag"
          fnClick={() => onShow()}
          size="sm"
          bs="light"
          txt={data?.version || ''}
          forceClose={show}
        />
      </span>
      <Modal
        show={show}
        backdrop="static"
        keyboard={false}
        centered
        size="xl"
        onHide={handleClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>{`${genericType} Information`}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {data ? (
            <div className="row">
              <div className="col-md-6">
                {leftFields.map(renderField)}
              </div>
              <div className="col-md-6">
                {rightFields.map(renderField)}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted">
              <p>No detailed information available.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-start">
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default InfoRenderer;
