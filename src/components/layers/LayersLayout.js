import React from 'react';
import sortBy from 'lodash/sortBy';
import { showProperties } from 'generic-ui-core';
import GenPropertiesLayer from './GenPropertiesLayer';
import GenProperties from '../fields/GenProperties';

const LayersLayout = (props) => {
  const {
    layers,
    options,
    funcChange,
    funcSubChange,
    funcClick,
    classStr,
    extLys,
    id,
    isPreview,
    activeWF,
    isSearch,
    fnNavi,
    isSpCall,
    hasAi,
    aiComp,
    expandAll,
  } = props;
  // if call from SP, extra layer is impossible
  const buildExtLys = isSpCall
    ? []
    : extLys.map((e) => (
        <GenProperties
          key={`${e.generic.id}_${e.field}_elementalPropertiesExt`}
          field={e.field}
          label="Short Label"
          classStr={classStr || ''}
          description={e.generic.description || ''}
          value={e.generic[e.field] || ''}
          type={e.type}
          isEditable={e.isEditable || true}
          readOnly={e.readOnly || false}
          isRequired={e.isRequired || false}
          onChange={(event) => funcChange(event, e.field, '', e.type)}
        />
      ));
  const sortedLayers = sortBy(layers, ['position', 'wf_position']) || [];
  const layout = [].concat(
    <div className="pb-3" key="ext-layers">
      {buildExtLys}
    </div>
  );
  sortedLayers.forEach((layer, idx) => {
    // if call from SP and layer is not sp, skip
    if (isSpCall && !layer.sp) return;
    const uk = `${layer.key}_${idx}`;
    if (
      typeof layer.cond_fields === 'undefined' ||
      layer.cond_fields == null ||
      layer.cond_fields.length === 0
    ) {
      const ig = (
        <GenPropertiesLayer
          id={id}
          key={uk}
          layer={layer}
          classStr={classStr || ''}
          onChange={funcChange}
          onSubChange={funcSubChange}
          selectOptions={options}
          onClick={funcClick}
          layers={layers}
          isPreview={isPreview}
          isSearch={isSearch}
          activeWF={activeWF}
          onNavi={fnNavi}
          isSpCall={isSpCall}
          hasAi={hasAi}
          aiComp={aiComp}
          expandAll={expandAll}
        />
      );
      layout.push(ig);
    } else if (layer?.cond_fields?.length > 0) {
      const [showLayer, showLabel] = showProperties(layer, layers);
      if (showLayer) {
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
            isSpCall={isSpCall}
            hasAi={hasAi}
            aiComp={aiComp}
            expandAll={expandAll}
          />
        );
        layout.push(igs);
      }
    }
  });
  return layout;
};

export default LayersLayout;
