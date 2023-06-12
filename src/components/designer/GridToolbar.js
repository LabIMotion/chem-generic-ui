import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';

const GridToolbar = ({ btnNew, fnClickLarge, fnClickSmall }) => (
  <ButtonGroup bsSize="xs">
    {btnNew}
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="_tooltip_theme_large">large grid size</Tooltip>}
    >
      <Button onClick={fnClickLarge}>
        <i className="fa fa-th-large" aria-hidden="true" />
      </Button>
    </OverlayTrigger>
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id="_tooltip_theme_small">small grid size</Tooltip>}
    >
      <Button onClick={fnClickSmall}>
        <i className="fa fa-th" aria-hidden="true" />
      </Button>
    </OverlayTrigger>
  </ButtonGroup>
);

GridToolbar.propTypes = {
  btnNew: PropTypes.element,
  fnClickLarge: PropTypes.func.isRequired,
  fnClickSmall: PropTypes.func.isRequired,
};

GridToolbar.defaultProps = { btnNew: null };

export default GridToolbar;
