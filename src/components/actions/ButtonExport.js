/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';

const ButtonExport = (props) => {
  const { generic, fnExport } = props;
  if (generic?.is_new) return null;

  const handleExport = () => {
    fnExport(generic);
  };

  return (
    <LTooltip idf="export_docx">
      <Button size="sm" variant="primary" onClick={() => handleExport()}>
        {FIcons.faFileWord} Export
      </Button>
    </LTooltip>
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
