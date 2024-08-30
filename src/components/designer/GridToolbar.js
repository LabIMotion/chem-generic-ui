import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup } from 'react-bootstrap';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

const GridToolbar = ({ btnNew, btnUpload, fnClickLarge, fnClickSmall }) => (
  <ButtonGroup bsSize="sm">
    {btnUpload}
    {btnNew}
    <LTooltip idf="grid_large">
      <Button onClick={fnClickLarge}>{FIcons.faTableCellsLarge}</Button>
    </LTooltip>
    <LTooltip idf="grid_small">
      <Button onClick={fnClickSmall}>{FIcons.faTableCells}</Button>
    </LTooltip>
  </ButtonGroup>
);

GridToolbar.propTypes = {
  btnNew: PropTypes.element,
  btnUpload: PropTypes.element,
  fnClickLarge: PropTypes.func.isRequired,
  fnClickSmall: PropTypes.func.isRequired,
};

GridToolbar.defaultProps = { btnNew: null, btnUpload: null };

export default GridToolbar;
