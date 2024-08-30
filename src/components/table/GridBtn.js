/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import GridDnD from '../dnd/GridDnD';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

const AddRowBtn = ({ addRow }) => (
  <LTooltip idf="add_entry">
    <Button onClick={() => addRow()} className="btn-gxs" bsStyle="primary">
      {FIcons.faPlus}
    </Button>
  </LTooltip>
);

AddRowBtn.propTypes = { addRow: PropTypes.func.isRequired };

const DelRowBtn = ({ delRow, node }) => {
  const { data } = node;
  return (
    <LTooltip idf="remove">
      <Button onClick={() => delRow(data)} className="btn-gxs">
        {FIcons.faMinus}
      </Button>
    </LTooltip>
  );
};

DelRowBtn.propTypes = {
  delRow: PropTypes.func.isRequired,
  node: PropTypes.object.isRequired,
};

const NullRowBtn = () => (
  <div className="grid-btn-none">{FIcons.faArrowsUpDownLeftRight}</div>
);

const DnDRowBtn = ({ moveRow, field, type, node }) => (
  <GridDnD
    field={field}
    type={type}
    rowValue={node.data}
    handleMove={moveRow}
  />
);

DnDRowBtn.propTypes = {
  moveRow: PropTypes.func.isRequired,
  field: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  node: PropTypes.object.isRequired,
};

export { AddRowBtn, DelRowBtn, DnDRowBtn, NullRowBtn };
