/* eslint-disable react/forbid-prop-types */
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import cloneDeep from 'lodash/cloneDeep';
import LayerOrderContent from '@components/designer/template/LayerOrderContent';
import ArrangeModal from '@components/actions/ArrangeModal';
import Constants from '@components/tools/Constants';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';
import Response from '@utils/response';
import { notifySuccess } from '@utils/template/designer-message';

function LayerOrderBtn({ generic = {}, genericType, fnSave = () => {} }) {
  const [show, setShow] = useState(false);
  const arrangeContentRef = useRef(null);

  if (Object.keys(generic.properties_template).length === 0) return null;

  const handleSave = (updatedLayers) => {
    // Save changes
    const updates = cloneDeep(generic);
    updates.properties_template.layers = updatedLayers;
    updates.changed = true;
    fnSave(new Response(notifySuccess(), updates));
  };

  return (
    <>
      <LTooltip idf="arrange_layer">
        <Button
          className="fw-medium"
          size="sm"
          variant="primary"
          onClick={() => setShow(true)}
        >
          {FIcons.faBars} Arrange Layers
        </Button>
      </LTooltip>
      <ArrangeModal
        genericType={genericType}
        showProps={{ show, setShow }}
        onSave={handleSave}
      >
        <LayerOrderContent
          ref={arrangeContentRef}
          element={cloneDeep(generic || {})}
        />
      </ArrangeModal>
    </>
  );
}

LayerOrderBtn.propTypes = {
  generic: PropTypes.object,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  fnSave: PropTypes.func,
};
LayerOrderBtn.defaultProps = {
  generic: {},
  fnSave: () => {},
};
export default LayerOrderBtn;
