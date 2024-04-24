/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import FIcons from '../icons/FIcons';

const BTN_EXPORT_TIP = (
  <Tooltip id="_cgu_tooltip_export">Export as docx file</Tooltip>
);

const ButtonExport = props => {
  const { generic, fnExport } = props;
  if (generic?.is_new) return null;

  const handleExport = () => {
    fnExport(generic);
  };

  return (
    <OverlayTrigger placement="top" overlay={BTN_EXPORT_TIP}>
      <Button bsSize="sm" bsStyle="primary" onClick={() => handleExport()}>
        {FIcons.faFileWord} Export
      </Button>
    </OverlayTrigger>
  );
};

ButtonExport.propTypes = {
  generic: PropTypes.object,
  fnExport: PropTypes.func,
};
ButtonExport.defaultProps = {
  generic: {},
  fnExport: () => {},
};
export default ButtonExport;
