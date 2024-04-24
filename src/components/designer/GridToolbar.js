import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import FIcons from '../icons/FIcons';

const GridToolbar = ({ btnNew, btnUpload, fnClickLarge, fnClickSmall }) => (
  <ButtonGroup bsSize="sm">
    {btnUpload}
    {btnNew}
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="_tooltip_theme_large">Enlarge grid size</Tooltip>}
    >
      <Button onClick={fnClickLarge}>{FIcons.faTableCellsLarge}</Button>
    </OverlayTrigger>
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="_tooltip_theme_small">Shrink grid size</Tooltip>}
    >
      <Button onClick={fnClickSmall}>{FIcons.faTableCells}</Button>
    </OverlayTrigger>
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
