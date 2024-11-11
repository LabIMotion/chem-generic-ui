import cloneDeep from 'lodash/cloneDeep';
import findIndex from 'lodash/findIndex';
import isArray from 'lodash/isArray';
import mergeWith from 'lodash/mergeWith';
import { FieldTypes, genUnits } from 'generic-ui-core';
import { toBool, toNum } from '../../components/tools/utils';
import organizeSubValues from '../../components/tools/collate';
import Constants from '../../components/tools/Constants';
import {
  FieldBase,
  ElementBase,
  SegmentBase,
} from '../../components/elements/BaseFields';
import mergeExt from '../ext-utils';

const ext = mergeExt();

export const mergeOptions = (A, B) => {
  return mergeWith({}, A, B, (objValue, srcValue) => {
    if (isArray(objValue) && isArray(srcValue)) {
      // Merge arrays and remove duplicates based on 'key' property
      const combined = [...objValue, ...srcValue];
      return combined.filter(
        (option, index, self) =>
          index === self.findIndex((o) => o.key === option.key)
      );
    }
    // Return undefined for lodash to handle the default merging
    return undefined;
  });
};

// current generic value, new klass value
export const remodel = (generic, klass) => {
  if (
    !generic ||
    Object.keys(klass || {}).length < 1 ||
    !generic.properties ||
    !klass.properties_release
  ) {
    return [undefined, undefined];
  }
  const newProps = cloneDeep(klass.properties_release);
  newProps.klass = generic.properties.klass;
  newProps.klass_uuid = klass.uuid;
  const newPropsSelectOptions = newProps.select_options || {};
  Object.keys(newProps.layers).forEach((key) => {
    const newLayer = newProps.layers[key] || {};
    newLayer.ai = generic.properties.layers[key]?.ai || []; // copy linked analyses or []
    if (generic.properties.layers[key]?.timeRecord) {
      newLayer.timeRecord = generic.properties.layers[key]?.timeRecord; // copy datetime of the layer or ''
    }
    const curFields =
      (generic.properties.layers[key] &&
        generic.properties.layers[key].fields) ||
      [];
    (newLayer.fields || []).forEach((f, idx) => {
      const curIdx = findIndex(curFields, (o) => o.field === f.field);
      if (curIdx >= 0) {
        const curVal = generic.properties.layers[key].fields[curIdx].value;
        const curType = typeof curVal;
        const newFieldType = newProps.layers[key].fields[idx].type;
        if (newFieldType === FieldTypes.F_DATETIME_RANGE) {
          if (
            generic.properties.layers[key].fields[curIdx].type !== newFieldType
          ) {
            newProps.layers[key].fields[idx].sub_fields = [];
          } else {
            const cSubs =
              generic.properties.layers[key].fields[curIdx].sub_fields || [];
            newProps.layers[key].fields[idx].sub_fields = cSubs;
          }
        }
        if (
          [
            FieldTypes.F_SELECT,
            FieldTypes.F_TEXT,
            FieldTypes.F_TEXTAREA,
            FieldTypes.F_FORMULA_FIELD,
          ].includes(newFieldType)
        ) {
          newProps.layers[key].fields[idx].value =
            curType !== FieldTypes.V_UNDEFINED ? (curVal || '').toString() : '';
        }
        if (newFieldType === 'select-multi') {
          newProps.layers[key].fields[idx].value = '';
          if (
            generic.properties.layers[key].fields[curIdx].type !== newFieldType
          ) {
            newProps.layers[key].fields[idx].sub_fields = [];
          } else {
            const newOptionLayers =
              newProps.layers[key].fields[idx].option_layers;
            const newOptions =
              (newPropsSelectOptions[newOptionLayers] || {}).options || [];
            if (newOptions.length < 1) {
              newProps.layers[key].fields[idx].sub_fields = [];
            } else {
              const newOptionsKeys = new Set(newOptions.map((o) => o.key));
              const cSubs =
                generic.properties.layers[key].fields[curIdx].sub_fields || [];
              newProps.layers[key].fields[idx].sub_fields = cSubs.filter((sf) =>
                newOptionsKeys.has(sf.value)
              );
            }
          }
        }
        if (newFieldType === FieldTypes.F_INTEGER) {
          const notInteger =
            curType === FieldTypes.V_UNDEFINED ||
            curType === FieldTypes.V_BOOLEAN ||
            isNaN(curVal);
          newProps.layers[key].fields[idx].value = notInteger
            ? 0
            : parseInt(curVal, 10);
        }
        if (newFieldType === FieldTypes.F_CHECKBOX) {
          newProps.layers[key].fields[idx].value =
            curType !== FieldTypes.V_UNDEFINED ? toBool(curVal) : false;
        }
        if (
          (newFieldType === FieldTypes.F_DRAG_ELEMENT &&
            generic.properties.layers[key].fields[curIdx].type ===
              FieldTypes.F_DRAG_ELEMENT) ||
          (newFieldType === FieldTypes.F_DRAG_SAMPLE &&
            generic.properties.layers[key].fields[curIdx].type ===
              FieldTypes.F_DRAG_SAMPLE) ||
          (newFieldType === FieldTypes.F_DRAG_MOLECULE &&
            generic.properties.layers[key].fields[curIdx].type ===
              FieldTypes.F_DRAG_MOLECULE) ||
          newFieldType === FieldTypes.F_DATETIME
        ) {
          if (typeof curVal !== 'undefined')
            newProps.layers[key].fields[idx].value = curVal;
        }
        if (newFieldType === FieldTypes.F_SYSTEM_DEFINED) {
          const units = genUnits(
            newProps.layers[key].fields[idx].option_layers,
            ext
          );
          const vs = units.find(
            (u) =>
              u.key ===
              generic.properties.layers[key].fields[curIdx].value_system
          );
          newProps.layers[key].fields[idx].value_system =
            (vs && vs.key) || units[0].key;
          if (curVal) {
            newProps.layers[key].fields[idx].value = toNum(curVal);
          }
        }
        if (newFieldType === FieldTypes.F_INPUT_GROUP) {
          if (
            generic.properties.layers[key].fields[curIdx].type !== newFieldType
          ) {
            newProps.layers[key].fields[idx].value = undefined;
          } else {
            const nSubs = newProps.layers[key].fields[idx].sub_fields || [];
            const cSubs =
              generic.properties.layers[key].fields[curIdx].sub_fields || [];
            const exSubs = [];
            if (nSubs.length < 1) {
              newProps.layers[key].fields[idx].value = undefined;
            } else {
              nSubs.forEach((nSub) => {
                const hitSub = cSubs.find((c) => c.id === nSub.id) || {};
                if (nSub.type === FieldTypes.F_LABEL) {
                  exSubs.push(nSub);
                }
                if (nSub.type === FieldTypes.F_TEXT) {
                  if (hitSub.type === FieldTypes.F_LABEL) {
                    exSubs.push(nSub);
                  } else {
                    exSubs.push({
                      ...nSub,
                      value: (hitSub.value || '').toString(),
                    });
                  }
                }
                if (
                  [FieldTypes.F_NUMBER, FieldTypes.F_SYSTEM_DEFINED].includes(
                    nSub.type
                  )
                ) {
                  const nvl =
                    typeof hitSub.value === 'undefined' ||
                    hitSub.value == null ||
                    hitSub.value.length === 0
                      ? ''
                      : toNum(hitSub.value);
                  if (nSub.option_layers === hitSub.option_layers) {
                    exSubs.push({
                      ...nSub,
                      value: nvl,
                      value_system: hitSub.value_system,
                    });
                  } else {
                    exSubs.push({ ...nSub, value: nvl });
                  }
                }
              });
            }
            newProps.layers[key].fields[idx].sub_fields = exSubs;
          }
        }
        if (newFieldType === FieldTypes.F_UPLOAD) {
          if (
            generic.properties.layers[key].fields[curIdx].type === newFieldType
          ) {
            newProps.layers[key].fields[idx].value =
              generic.properties.layers[key].fields[curIdx].value;
          } else {
            newProps.layers[key].fields[idx].value = {};
          }
        }
        if (newFieldType === FieldTypes.F_TABLE) {
          if (
            generic.properties.layers[key].fields[curIdx].type !== newFieldType
          ) {
            newProps.layers[key].fields[idx].sub_values = [];
          } else {
            newProps.layers[key].fields[idx].sub_values = organizeSubValues(
              newProps.layers[key].fields[idx],
              generic.properties.layers[key].fields[curIdx]
            );
          }
        }
      }
    });
  });
  return [generic.properties, newProps];
};

// input source generic and target generic; when there are reaction layers in the source generic, add them to the target generic
export const importReaction = (source, target) => {
  let newTarget = target;
  let hasReaction = false;
  if (source && source.properties && target && target.properties) {
    const srcProps = source.properties;
    const srcLayers = srcProps.layers;

    const reactionLayers = Object.keys(srcLayers).filter((key) =>
      key.startsWith(Constants.SYS_REACTION)
    );

    // add these reaction layers to the target generic
    if (reactionLayers.length > 0) {
      hasReaction = true;
      newTarget = cloneDeep(target);
      reactionLayers.forEach((key) => {
        newTarget.properties.layers[key] = srcLayers[key];
      });
    }
  }
  return [hasReaction, newTarget];
};

// replace by mergeOptions
export const mergeSelections = (source, target) => {
  if (
    Object.keys(source || {}).length < 1 ||
    Object.keys(target || {}).length < 1
  ) {
    return target;
  }
  const newTarget = cloneDeep(target);
  Object.keys(source).forEach((key) => {
    // Check if the source key exists and has options
    if (source[key] && source[key].options) {
      // Initialize the key in newTarget if it doesn't exist
      if (!newTarget[key]) {
        newTarget[key] = {};
      }
      // Initialize options array in newTarget[key] if it doesn't exist
      if (!Array.isArray(newTarget[key].options)) {
        newTarget[key].options = [];
      }

      // Merge options, ensuring no duplicates based on the key property
      source[key].options.forEach((newOption) => {
        if (
          !newTarget[key].options.some(
            (existingOption) => existingOption.key === newOption.key
          )
        ) {
          newTarget[key].options.push(newOption);
        }
      });

      // // Optionally, merge descriptions if necessary
      newTarget[key].desc = source[key].desc || newTarget[key].desc;
    }
  });
  return newTarget;
};

export const updateUnsupports = (layer, genericType) => {
  const supports = {
    Element: ElementBase,
    Segment: SegmentBase,
    default: FieldBase,
  };
  const supportedFields = supports[genericType] || supports.default;
  return {
    ...layer,
    fields: layer.fields.map((field) => {
      if (
        !supportedFields.some((supported) => supported.value === field.type)
      ) {
        const { option_layers: optionLayers, ...restField } = field;
        return {
          ...restField,
          type: 'text',
          text_sub_fields: [],
          sub_fields: [],
        };
      }
      return field;
    }),
  };
};
