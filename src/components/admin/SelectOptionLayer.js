/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';
import SelectAttrNewModal from '@components/admin/SelectAttrNewModal';
import Selection from '@components/admin/Selection';
import ButtonTooltip from '@components/fields/ButtonTooltip';
import {
  handleAddOption,
  handleAddSelect,
  handleOptionInput,
} from '@utils/template/action-handler';
import fbc from '@components/tools/ui-styles';

const SelectOptionLayer = (props) => {
  const { generic, fnChange } = props;

  const [showAddSelect, setShowAddSelect] = useState(false);

  const onAdd = (_key, _optionKey, _selectOptions) => {
    const result = handleAddOption(generic, _key, _optionKey, _selectOptions);
    fnChange(result);
    setShowAddSelect(false);
  };

  const onCreate = (selectName) => {
    const sos = { ...generic.properties_template?.select_options };
    sos[selectName] = {};
    const result = handleAddSelect(generic, selectName, sos);
    fnChange(result);
    setShowAddSelect(false);
  };

  const onOptionInputChange = (event, optionKey, selectKey) => {
    const input = event.target.value;
    const result = handleOptionInput(generic, optionKey, selectKey, input);
    fnChange(result);
  };

  return (
    <div>
      <Card className="border-0">
        <Card.Header
          as="h5"
          className={`${fbc} lu-bg-white`}
        >
          Selection Lists
          <ButtonTooltip
            idf="sel_add"
            fnClick={() => setShowAddSelect(true)}
            fa="faPlus"
            size="sm"
            bs="primary"
            txt="Add new selection list"
            btnCls="ms-auto fw-medium"
          />
        </Card.Header>
        <Card.Body>
          {Object.keys(generic.properties_template?.select_options || {}).map(
            (root) => {
              return (
                <Selection
                  key={root}
                  generic={generic}
                  root={root}
                  fnAdd={onAdd}
                  fnChange={fnChange}
                  fnInputChg={onOptionInputChange}
                />
              );
            }
          )}
        </Card.Body>
      </Card>
      <SelectAttrNewModal
        showModal={showAddSelect}
        fnClose={() => setShowAddSelect(false)}
        fnCreate={onCreate}
      />
    </div>
  );
};

SelectOptionLayer.propTypes = {
  generic: PropTypes.object.isRequired,
  fnChange: PropTypes.func.isRequired,
};

export default SelectOptionLayer;
