/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';
import ButtonTooltip from '@components/fields/ButtonTooltip';
import SelectOption from '@components/admin/SelectOption';
import SelectOptionList from '@components/admin/SelectOptionList';
import renderDeleteButton from '@components/admin/renderDeleteButton';

const Selection = (props) => {
  const { generic, root, fnAdd, fnChange, fnInputChg } = props;
  const [expand, setExpand] = useState(false);

  const handleAddOption = (_root, _input, _select) => {
    setExpand(true);
    fnAdd(_root, _input, _select);
  };

  return (
    <Row>
      <Col md={12}>
        <SelectOption
          generic={generic}
          root={root}
          fnAddOption={handleAddOption}
          fnChange={fnChange}
        >
          {renderDeleteButton(generic, 'Select', root, '', fnChange)}
          <ButtonTooltip
            idf={`dtl_${expand ? 'collapse' : 'expand'}`}
            fnClick={() => setExpand(!expand)}
            fa={`faCaret${expand ? 'Up' : 'Down'}`}
          />
        </SelectOption>
      </Col>
      {expand && (
        <SelectOptionList
          generic={generic}
          root={root}
          fnInputChg={fnInputChg}
          fnDel={fnChange}
        />
      )}
    </Row>
  );
};

Selection.propTypes = {
  generic: PropTypes.object.isRequired,
  root: PropTypes.string.isRequired,
  fnAdd: PropTypes.func.isRequired,
  fnInputChg: PropTypes.func.isRequired,
  fnChange: PropTypes.func.isRequired,
};

export default Selection;
