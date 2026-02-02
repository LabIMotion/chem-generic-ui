/* eslint-disable react/forbid-prop-types */
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import cloneDeep from 'lodash/cloneDeep';
import ArrangeContent from '@components/actions/ArrangeContent';
import ArrangeModal from '@components/actions/ArrangeModal';
import Constants from '@components/tools/Constants';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';

function ButtonArrange({ generic = {}, genericType, fnSave = () => {} }) {
  const [show, setShow] = useState(false);
  const arrangeContentRef = useRef(null);
  if (generic?.is_new) return null;
  if (
    Object.keys(generic.properties).length === 0 ||
    genericType === Constants.GENERIC_TYPES.DATASET
  )
    return null;

  const handleSave = (updatedData) => {
    const updates = cloneDeep(generic);
    updates.properties.layers = updatedData.layers;

    const groups = updatedData.metadata?.groups || [];
    if (groups.length === 0) {
      updates.metadata = {};
    } else {
      updates.metadata = {
        groups,
        restrict: updatedData.metadata?.restrict || {},
      };
    }
    updates.changed = true;
    fnSave(updates);
  };

  return (
    <>
      <LTooltip idf="arrange_layer">
        <Button size="sm" variant="primary" onClick={() => setShow(true)}>
          {FIcons.faBars} Arrange
        </Button>
      </LTooltip>
      <ArrangeModal
        genericType={genericType}
        showProps={{ show, setShow }}
        onSave={handleSave}
      >
        <ArrangeContent
          ref={arrangeContentRef}
          element={cloneDeep(generic || {})}
        />
      </ArrangeModal>
    </>
  );
}

ButtonArrange.propTypes = {
  generic: PropTypes.object,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
  ]).isRequired,
  fnSave: PropTypes.func,
};
ButtonArrange.defaultProps = {
  generic: {},
  fnSave: () => {},
};
export default ButtonArrange;
