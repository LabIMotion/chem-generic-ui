import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import LayersGrid from '@components/designer/template/LayerGrid';
import LayerGridView from '@components/designer/template/LayerGridView';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';

const LayerGridBtn = ({ fnCreate, fnDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [viewLayer, setViewLayer] = useState(null);

  useEffect(() => {
    if (!showModal) {
      setViewLayer(null);
    }
  }, [showModal]);

  const handleShow = () => setShowModal(true);
  const handleClose = () => setShowModal(false);

  const handleSelectLayer = (params) => {
    fnCreate(params.data?.properties);
    setShowModal(false);
  };

  const handleDeleteLayer = (params) => {
    fnDelete(params.data);
    setShowModal(false);
  };

  const handleViewLayer = (params) => {
    const selectOptions = params.data.properties?.select_options;
    const generic = {
      properties: {
        layers: {
          [params.data.name]: {
            ...params.data.properties,
          },
        },
        ...(selectOptions && { select_options: selectOptions }),
      },
      properties_release: {
        layers: {
          [params.data.name]: {
            ...params.data.properties,
          },
        },
        ...(selectOptions && { select_options: selectOptions }),
      },
    };
    const ext = {
      description: params.data.description,
      label: params.data.label,
      name: params.data.name,
    };
    setViewLayer({ generic, ext });
  };

  const handleCloseView = () => {
    setViewLayer(null);
  };

  return (
    <>
      <LTooltip idf="sel_lyr2tpl">
        <Button
          className="fw-medium"
          size="sm"
          variant="primary"
          onClick={handleShow}
        >
          {FIcons.faGlobe}&nbsp;Standard Layers
        </Button>
      </LTooltip>
      <Modal
        centered
        show={showModal}
        onHide={handleClose}
        dialogClassName="gu_modal-68w"
      >
        <Modal.Header closeButton>
          <Modal.Title>Standard Layer List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewLayer ? (
            <LayerGridView _layer={viewLayer} />
          ) : (
            <LayersGrid
              onLayerSelect={handleSelectLayer}
              onLayerDelete={handleDeleteLayer}
              onLayerView={handleViewLayer}
            />
          )}
        </Modal.Body>
        <Modal.Footer className="justify-content-start">
          {viewLayer && (
            <LTooltip idf="return_to_list">
              <Button className="gu-mr-1" onClick={handleCloseView}>
                Back to list
              </Button>
            </LTooltip>
          )}
          <LTooltip idf="close">
            <Button variant="primary" onClick={handleClose}>
              Close
            </Button>
          </LTooltip>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LayerGridBtn;
