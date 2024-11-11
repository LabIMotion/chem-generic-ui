/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import cloneDeep from 'lodash/cloneDeep';
import sortBy from 'lodash/sortBy';
import { orgLayerObject } from 'generic-ui-core';
import { importReaction, remodel } from '../../utils/template/remodel-handler';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

// current generic value, new klass value
const ButtonReload = (props) => {
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
    <LTooltip idf="reload_temp">
      <Button size="sm" variant="primary" onClick={() => handleReload()}>
        {FIcons.faArrowsRotate} Reload
      </Button>
    </LTooltip>
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
