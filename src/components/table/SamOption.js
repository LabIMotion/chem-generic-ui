/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { OverlayTrigger, Radio, Tooltip } from 'react-bootstrap';

const SamOption = props => {
  const { sField, node, onChange } = props;
  const { data } = node;
  const fValue = (data[sField.id] && data[sField.id].value) || {};
  if (!fValue.is_new) return <div />;
  const rUUID = uuid();
  return (
    <div className="generic_sam_options">
      <OverlayTrigger delayShow={1000} placement="right" overlay={<Tooltip id={uuid()}>associate with this sample</Tooltip>}>
        <Radio
          name={`dropS_${rUUID}`}
          disabled={fValue.isAssoc}
          checked={fValue.cr_opt === 0}
          onChange={() => onChange({ node, subField: sField, crOpt: 0 })}
        >
          Current
        </Radio>
      </OverlayTrigger>
      <OverlayTrigger delayShow={1000} placement="right" overlay={<Tooltip id={uuid()}>split from the sample first and then associate with it</Tooltip>}>
        <Radio
          name={`dropS_${rUUID}`}
          checked={fValue.cr_opt === 1}
          onChange={() => onChange({ node, subField: sField, crOpt: 1 })}
        >
          Split
        </Radio>
      </OverlayTrigger>
      <OverlayTrigger delayShow={1000} placement="right" overlay={<Tooltip id={uuid()}>duplicate the sample first and then associate with it</Tooltip>}>
        <Radio
          name={`dropS_${rUUID}`}
          checked={fValue.cr_opt === 2}
          onChange={() => onChange({ node, subField: sField, crOpt: 2 })}
        >
          Copy
        </Radio>
      </OverlayTrigger>
    </div>
  );
};

SamOption.propTypes = {
  sField: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default SamOption;
