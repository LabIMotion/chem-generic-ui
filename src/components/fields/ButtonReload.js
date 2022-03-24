/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import reinventGeneric from '../tools/reinventGeneric';

const BTN_RELOAD_TIP = <Tooltip>click to reload the template</Tooltip>;

const ButtonReload = (props) => {
  const { klass, generic, fnReload } = props;
console.log(klass);
console.log(generic);
  if (!generic) return null;

  if (generic && (typeof generic.klass_uuid === 'undefined'
  || generic.klass_uuid === klass.uuid || generic.is_new)) {
    return null;
  }

  const handleReload = () => {
    const output = reinventGeneric(generic, klass);
    generic.properties = output[1];
    generic.changed = true;
    fnReload(generic);
  };

  return (
    <OverlayTrigger placement="top" overlay={BTN_RELOAD_TIP}>
      <Button bsSize="xsmall" bsStyle="primary" onClick={() => handleReload()}>
        <i className="fa fa-refresh" aria-hidden="true" />
        {' '}
        Reload
      </Button>
    </OverlayTrigger>
  );
};

ButtonReload.propTypes = {
  klass: PropTypes.object,
  generic: PropTypes.object,
  fnReload: PropTypes.func
};
ButtonReload.defaultProps = {
  klass: {}, generic: {}, fnReload: () => {}
};
export default ButtonReload;
