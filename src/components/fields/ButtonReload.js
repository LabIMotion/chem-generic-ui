/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import cloneDeep from 'lodash/cloneDeep';
import sortBy from 'lodash/sortBy';
import { orgLayerObject } from 'generic-ui-core';
import { importReaction, remodel } from '@utils/template/remodel-handler';
import { reorderPositions } from '@utils/template/sorting-handler';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';

// current generic value, new klass value
function ButtonReload(props) {
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
      outGeneric.properties_release = klass.properties_release;
      outGeneric.metadata = klass.metadata || {};
      outGeneric.changed = true;

      // Import reaction layers from original if they exist
      const importResult = importReaction(original, outGeneric);
      if (importResult[0]) {
        outGeneric = importResult[1];

        // Sort layers (NEW template layers + imported reactions) by position and wf_position
        const sortedLayers = sortBy(
          Object.values(outGeneric.properties.layers),
          ['position', 'wf_position'],
        );

        // Convert array back to object and reorder positions considering NEW template's groups
        const layersObj = orgLayerObject(sortedLayers);
        const reordered = reorderPositions(layersObj, outGeneric.metadata);

        outGeneric.properties.layers = reordered.layers;
        outGeneric.metadata = reordered.metadata;
      }
    } else {
      outGeneric = output[1];
    }
    fnReload(outGeneric);
  };

  return (
    <LTooltip idf="reload_temp">
      <Button size="sm" variant="primary" onClick={() => handleReload()}>
        {FIcons.faArrowsRotate} Reload
      </Button>
    </LTooltip>
  );
}

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
