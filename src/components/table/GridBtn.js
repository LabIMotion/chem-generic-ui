/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { v4 as uuid } from 'uuid';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import GridDnD from '../dnd/GridDnD';
import FIcons from '../icons/FIcons';

const AddRowBtn = ({ addRow }) => (
  <OverlayTrigger
    delayShow={1000}
    placement="top"
    overlay={<Tooltip id={uuid()}>add entry</Tooltip>}
  >
    <Button onClick={() => addRow()} className="btn-gxs" bsStyle="primary">
      {FIcons.faPlus}
    </Button>
  </OverlayTrigger>
);

AddRowBtn.propTypes = { addRow: PropTypes.func.isRequired };

const DelRowBtn = ({ delRow, node }) => {
  const { data } = node;
  return (
    <OverlayTrigger
      delayShow={1000}
      placement="top"
      overlay={<Tooltip id={uuid()}>remove</Tooltip>}
    >
      <Button onClick={() => delRow(data)} className="btn-gxs">
        {FIcons.faMinus}
      </Button>
    </OverlayTrigger>
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
