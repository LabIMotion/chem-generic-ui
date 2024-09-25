import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'react-bootstrap';
import LayersGrid from './LayerGrid';
import LayerGridView from './LayerGridView';
import FIcons from '../../icons/FIcons';
import LTooltip from '../../shared/LTooltip';

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
        <Button className="button-right btn-gxs" onClick={handleShow}>
          {FIcons.faGlobe}&nbsp;Standard Layers
        </Button>
      </LTooltip>
      <Modal
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
        <Modal.Footer>
          {viewLayer && (
            <LTooltip idf="return_to_list">
              <Button className="gu-mr-1" onClick={handleCloseView}>
                Back to list
              </Button>
            </LTooltip>
          )}
          <LTooltip idf="close">
            <Button bsStyle="primary" onClick={handleClose}>
              Close
            </Button>
          </LTooltip>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default LayerGridBtn;
