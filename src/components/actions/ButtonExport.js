/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

const BTN_EXPORT_TIP = (
  <Tooltip id="_cgu_tooltip_export">click to export as docx file</Tooltip>
);

const ButtonExport = props => {
  const { generic, fnExport } = props;
  if (generic?.is_new) return null;

  const handleExport = () => {
    fnExport(generic);
  };

  return (
    <OverlayTrigger placement="top" overlay={BTN_EXPORT_TIP}>
      <Button bsSize="xsmall" bsStyle="primary" onClick={() => handleExport()}>
        <i className="fa fa-download" aria-hidden="true" /> Export
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
