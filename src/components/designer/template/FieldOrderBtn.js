/* eslint-disable react/forbid-prop-types */
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import cloneDeep from 'lodash/cloneDeep';
import FieldOrderContent from '@components/designer/template/FieldOrderContent';
import ArrangeModal from '@components/actions/ArrangeModal';
import Constants from '@components/tools/Constants';
import FIcons from '@components/icons/FIcons';
import Response from '@utils/response';
import { notifySuccess } from '@utils/template/designer-message';

const FieldOrderBtn = ({
  layer = {},
  generic = {},
  genericType,
  fnSave = () => {},
}) => {
  const [show, setShow] = useState(false);
  const arrangeContentRef = useRef(null);

  if ((layer.fields || []).length === 0) return null;

  const handleSave = (updatedFields) => {
    // Save changes
    const updates = cloneDeep(generic);
    updates.properties_template.layers[layer.key].fields = updatedFields;
    updates.changed = true;
    fnSave(new Response(notifySuccess(), updates));
  };

  return (
    <>
      <Dropdown.Item
        eventKey={`arrange_fields.${layer.label}`}
        onClick={() => setShow(true)}
      >
        {FIcons.faBars}&nbsp;&nbsp;Arrange Fields Order
      </Dropdown.Item>
      <ArrangeModal
        genericType={genericType}
        showProps={{ show, setShow }}
        onSave={handleSave}
      >
        <FieldOrderContent ref={arrangeContentRef} layer={layer} />
      </ArrangeModal>
    </>
  );
};

FieldOrderBtn.propTypes = {
  layer: PropTypes.object,
  generic: PropTypes.object,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  fnSave: PropTypes.func,
};
FieldOrderBtn.defaultProps = {
  layer: {},
  generic: {},
  fnSave: () => {},
};
export default FieldOrderBtn;
