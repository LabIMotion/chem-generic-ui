/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { cloneDeep, sortBy } from 'lodash';
import { importReaction, remodel } from '../../utils/template/remodel-handler';
import { orgLayerObject } from '../tools/orten';
import FIcons from '../icons/FIcons';

const BTN_RELOAD_TIP = (
  <Tooltip id="_cgu_tooltip_reload">click to reload the template</Tooltip>
);

// current generic value, new klass value
const ButtonReload = props => {
  const { klass, generic, fnReload } = props;
  if (
    generic &&
    (typeof generic.klass_uuid === 'undefined' ||
      generic.klass_uuid === klass.uuid ||
      generic.is_new)
  ) {
    return null;
  }

  const handleReload = () => {
    const original = cloneDeep(generic);
    let outGeneric = generic;
    const output = remodel(generic, klass);
    if (output[1]) {
      outGeneric.properties = output[1];
      outGeneric.changed = true;
      const importResult = importReaction(original, outGeneric);
      if (importResult[0]) {
        outGeneric = importResult[1];
        const sortedLayers = sortBy(outGeneric.properties.layers, ['position']);
        sortedLayers.map((e, ix) => {
          e.position = (ix + 1) * 10;
          return e;
        });
        outGeneric.properties.layers = orgLayerObject(sortedLayers);
      }
    } else {
      outGeneric = output[1];
    }
    if (outGeneric) outGeneric.properties_release = klass.properties_release;
    fnReload(outGeneric);
  };

  return (
    <OverlayTrigger placement="top" overlay={BTN_RELOAD_TIP}>
      <Button bsSize="sm" bsStyle="primary" onClick={() => handleReload()}>
        {FIcons.faArrowsRotate} Reload
      </Button>
    </OverlayTrigger>
  );
};

ButtonReload.propTypes = {
  klass: PropTypes.object,
  generic: PropTypes.object,
  fnReload: PropTypes.func,
};
ButtonReload.defaultProps = {
  klass: {},
  generic: {},
  fnReload: () => {},
};
export default ButtonReload;
