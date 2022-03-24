import React from 'react';
import { sortBy } from 'lodash';
import GenPropertiesLayer from './GenPropertiesLayer';
import GenProperties from '../fields/GenProperties';

const LayersLayout = (
  layers, options, funcChange,
  funcSubChange = () => {}, funcClick = () => {}, extLys = [], id = 0, isPreview = false,
  activeWF = false, isSearch = false, fnNavi = () => {}
) => {
  const buildExtLys = extLys.map(e => (
    <GenProperties
      key={`${e.generic.id}_elementalPropertiesExt`}
      field={e.field}
      label=""
      description={e.generic.description || ''}
      value={e.generic.name || ''}
      type={e.type}
      isEditable={e.isEditable || true}
      readOnly={e.readOnly || false}
      isRequired={e.isRequired || false}
      onChange={event => funcChange(event, e.field, '', e.type)}
    />
  ));
  const sortedLayers = sortBy(layers, ['position', 'wf_position']) || [];
  const layout = [].concat(buildExtLys);
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
          isSearch={isSearch}
          activeWF={activeWF}
          onNavi={fnNavi}
        />
      );
      layout.push(ig);
    } else if (layer.cond_fields && layer.cond_fields.length > 0) {
      let showLayer = false;

      for (let i = 0; i < layer.cond_fields.length; i += 1) {
        const cond = layer.cond_fields[i] || {};
        const fd = ((layers[cond.layer] || {}).fields || [])
          .find(f => f.field === cond.field) || {};
        if (fd.type === 'checkbox' && ((['false', 'no', 'f', '0'].includes((cond.value || '').trim().toLowerCase()) && (typeof (fd && fd.value) === 'undefined' || fd.value === false))
        || (['true', 'yes', 't', '1'].includes((cond.value || '').trim().toLowerCase()) && (typeof fd.value !== 'undefined' && fd.value === true)))) {
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
            isSearch={isSearch}
            activeWF={activeWF}
            onNavi={fnNavi}
          />
        );
        layout.push(igs);
      }
    }
  });
  return layout;
};

export default LayersLayout;
