import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';

const GridToolbar = ({ btnNew, btnUpload, fnClickLarge, fnClickSmall, children }) => (
  <ButtonGroup className="ms-2">
    {btnUpload}
    {btnNew}
    <LTooltip idf="grid_large">
      <Button onClick={fnClickLarge} variant="outline-secondary" className="gu-btn-outline-secondary">
        {FIcons.faTableCellsLarge}
      </Button>
    </LTooltip>
    <LTooltip idf="grid_small">
      <Button onClick={fnClickSmall} variant="outline-secondary" className="gu-btn-outline-secondary">
        {FIcons.faTableCells}
      </Button>
    </LTooltip>
    {children}
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
