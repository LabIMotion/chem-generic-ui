import React from 'react';
import GenPropertiesLayer from '@components/layers/GenPropertiesLayer';
import GenPropertiesGroup from '@components/layers/GenPropertiesGroup';
import GenProperties from '@components/fields/GenProperties';
import { organizeLayersForDisplay } from '@utils/template/group-handler';
import { isItemEffectivelyVisible } from '@utils/template/visibility-handler';
import { editable } from '@/utils/pureUtils';
import { useGenInterfaceContext } from '@components/details/GenInterfaceContext';

const LayersLayout = (props) => {
  const {
    generic,
    // layers,
    // options,
    funcChange,
    funcSubChange,
    funcClick,
    // classStr,
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
    editMode,
    genericType,
  } = props;

  const { refSource } = useGenInterfaceContext();

  const layers = generic.properties?.layers || {};
  const options = generic.properties_release?.select_options || {};
  const classStr = generic?.short_label || '';
  const metadata = generic.metadata || {};
  const groups = metadata.groups || [];
  const restrictions = metadata.restrict || {};

  // if call from SP, extra layer is impossible
  const buildExtLys = isSpCall
    ? []
    : extLys.map((e) => (
        <GenProperties
          key={`${e.generic.id}_${e.field}_elementalPropertiesExt`}
          field={e.field}
          label="Name"
          classStr={classStr || ''}
          description={e.generic.description || ''}
          value={e.generic[e.field] || ''}
          type={e.type}
          isEditable={editable(editMode, true)}
          readOnly={!editable(editMode, true)}
          isRequired={e.isRequired || false}
          onChange={(event) => funcChange(event, e.field, '', e.type)}
          genericType={genericType}
        />
      ));

  const layout = [].concat(
    <div className="pb-3" key="ext-layers">
      {buildExtLys}
    </div>,
  );

  // Get organized display items
  const displayItems = organizeLayersForDisplay(layers, groups);

  const layerProps = {
    id,
    classStr: classStr || '',
    onChange: funcChange,
    onSubChange: funcSubChange,
    selectOptions: options,
    onClick: funcClick,
    layers: layers,
    isPreview,
    isSearch,
    activeWF,
    onNavi: fnNavi,
    isSpCall,
    hasAi,
    aiComp,
    expandAll,
    editMode: editable(editMode, true),
    genericType,
  };

  displayItems.forEach((item, idx) => {
    if (item.type === 'group') {
      // Render grouped layers
      const groupLayers = item.layers.map((layer) => layer.data);

      // Skip if all layers in group should be hidden due to SP call
      if (isSpCall && groupLayers.every((layer) => !layer.sp)) return;

      // Filter layers for SP call
      const filteredGroupLayers = isSpCall
        ? groupLayers.filter((layer) => layer.sp)
        : groupLayers;

      if (filteredGroupLayers.length === 0) return;

      // Check if group should be shown based on its restrictions
      const groupRestriction = restrictions[item.id];
      if (
        groupRestriction &&
        groupRestriction.cond &&
        groupRestriction.cond.length > 0
      ) {
        // Transform restriction format to expected format
        const transformedRestriction = {
          cond_fields: groupRestriction.cond.map((c) => ({
            ...c,
            value: c.eq || c.value,
          })),
          cond_operator: groupRestriction.op,
        };

        const [showGroup] = isItemEffectivelyVisible(transformedRestriction, layers, refSource?.element);
        if (!showGroup) return; // Skip this group if conditions are not met
      }

      const groupElement = (
        <GenPropertiesGroup
          key={`group-${item.id}-${idx}`}
          groupId={item.id}
          groupLabel={item.label}
          groupLayers={filteredGroupLayers}
          restriction={restrictions[item.id]}
          allLayers={layers}
          {...layerProps}
        />
      );
      layout.push(groupElement);
    } else {
      // Render individual ungrouped layer
      const layer = item.data;

      // if call from SP and layer is not sp, skip
      if (isSpCall && !layer.sp) return;

      const uk = `${layer.key}_${idx}`;

      if (
        typeof layer.cond_fields === 'undefined' ||
        layer.cond_fields == null ||
        layer.cond_fields.length === 0
      ) {
        const ig = (
          <GenPropertiesLayer key={uk} layer={layer} grouped={false} {...layerProps} />
        );
        layout.push(ig);
      } else if (layer?.cond_fields?.length > 0) {
        const [showLayer] = isItemEffectivelyVisible(layer, layers, refSource?.element);
        if (showLayer) {
          const igs = (
            <GenPropertiesLayer key={uk} layer={layer} grouped={false} {...layerProps} />
          );
          layout.push(igs);
        }
      }
    }
  });

  return layout;
};

export default LayersLayout;
