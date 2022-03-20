import React from 'react';
import { sortBy } from 'lodash';
import GenPropertiesLayer from './GenPropertiesLayer';

const LayersLayout = (
  layers, options, funcChange,
  funcSubChange = () => {}, funcClick = () => {}, layout = [], id = 0, isPreview = false,
  activeWF = false
) => {
  const sortedLayers = sortBy(layers, ['position', 'wf_position']) || [];
  sortedLayers.forEach((layer, idx) => {
    const uk = `${layer.key}_${idx}`;
    if (typeof layer.cond_fields === 'undefined' || layer.cond_fields == null || layer.cond_fields.length === 0) {
      const ig = (
        <GenPropertiesLayer
          id={id}
          key={uk}
          layer={layer}
          onChange={funcChange}
          onSubChange={funcSubChange}
          selectOptions={options}
          onClick={funcClick}
          layers={layers}
          isPreview={isPreview}
          activeWF={activeWF}
        />
      );
      layout.push(ig);
    } else if (layer.cond_fields && layer.cond_fields.length > 0) {
      let showLayer = false;

      for (let i = 0; i < layer.cond_fields.length; i += 1) {
        const cond = layer.cond_fields[i] || {};
        const fd = ((layers[cond.layer] || {}).fields || [])
          .find(f => f.field === cond.field) || {};
        if (fd.type === 'checkbox' && ((['false', 'no', 'f', '0'].includes((cond.value || '').trim().toLowerCase()) && (typeof (fd && fd.value) === 'undefined' || fd.value === false)) ||
        (['true', 'yes', 't', '1'].includes((cond.value || '').trim().toLowerCase()) && (typeof fd.value !== 'undefined' && fd.value === true)))) {
          showLayer = true;
          break;
        } else if (['text', 'select'].includes(fd.type) && (typeof (fd && fd.value) !== 'undefined' && (fd.value || '').trim() === (cond.value || '').trim())) {
          showLayer = true;
          break;
        }
      }

      if (showLayer === true) {
        const igs = (
          <GenPropertiesLayer
            id={id}
            key={uk}
            layer={layer}
            onChange={funcChange}
            onSubChange={funcSubChange}
            selectOptions={options}
            onClick={funcClick}
            layers={layers}
            isPreview={isPreview}
            activeWF={activeWF}
          />
        );
        layout.push(igs);
      }
    }
  });
  return layout;
};

export default LayersLayout;
