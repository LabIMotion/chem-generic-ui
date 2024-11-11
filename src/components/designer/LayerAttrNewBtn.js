/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import LayerAttrModal from '../elements/LayerAttrModal';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

const LayerAttrNewBtn = (props) => {
  const { fnCreate, isAttrOnWF } = props;
  const [show, setShow] = useState(false);

  return (
    <>
      <LTooltip idf="add_layer">
        <Button
          className="fw-medium"
          size="sm"
          variant="primary"
          onClick={() => setShow(true)}
        >
          {FIcons.faPlus}&nbsp;Add new layer
        </Button>
      </LTooltip>
      <LayerAttrModal
        actions={[{ action: 'c', fnAction: fnCreate }]}
        isAttrOnWF={isAttrOnWF}
        showProps={{ show, setShow }}
      />
    </>
  );
};

LayerAttrNewBtn.propTypes = {
  fnCreate: PropTypes.func.isRequired,
  isAttrOnWF: PropTypes.bool,
};

LayerAttrNewBtn.defaultProps = { isAttrOnWF: false };

export default LayerAttrNewBtn;
