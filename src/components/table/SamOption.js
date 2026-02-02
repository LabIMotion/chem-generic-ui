/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { Form } from 'react-bootstrap';
import LTooltip from '@components/shared/LTooltip';

const SamOption = (props) => {
  const { sField, node, onChange, genericType } = props;
  const { data } = node;
  const fValue = (data[sField.id] && data[sField.id].value) || {};
  if (!fValue.is_new) return <div />;
  const rUUID = uuid();

  if (genericType === 'Segment') {
    return (
      <div className="generic_sam_options">
      <LTooltip idf="associate_direct" placement="right">
        <Form.Check
          type="radio"
          name={`dropS_${rUUID}`}
          disabled={fValue.isAssoc} // the isAssoc is false because no need to associate
          checked={fValue.cr_opt === 0}
          onChange={() => onChange({ node, subField: sField, crOpt: 0 })}
          label="Current"
        />
      </LTooltip>
    </div>
    )
  }

  return (
    <div className="generic_sam_options">
      <LTooltip idf="associate_direct" placement="right">
        <Form.Check
          type="radio"
          name={`dropS_${rUUID}`}
          disabled={fValue.isAssoc}
          checked={fValue.cr_opt === 0}
          onChange={() => onChange({ node, subField: sField, crOpt: 0 })}
          label="Current"
        />
      </LTooltip>
      <LTooltip idf="associate_split" placement="right">
        <Form.Check
          type="radio"
          name={`dropS_${rUUID}`}
          checked={fValue.cr_opt === 1}
          onChange={() => onChange({ node, subField: sField, crOpt: 1 })}
          label="Split"
        />
      </LTooltip>
      <LTooltip idf="associate_duplicate" placement="right">
        <Form.Check
          type="radio"
          name={`dropS_${rUUID}`}
          checked={fValue.cr_opt === 2}
          onChange={() => onChange({ node, subField: sField, crOpt: 2 })}
          label="Copy"
        />
      </LTooltip>
    </div>
  );
};

SamOption.propTypes = {
  sField: PropTypes.object.isRequired,
  node: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SamOption;
