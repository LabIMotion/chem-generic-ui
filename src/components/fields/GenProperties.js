import React from 'react';
import { FieldTypes } from 'generic-ui-core';
import {
  GenPropertiesCheckbox,
  GenPropertiesDate,
  GenPropertiesDateTimeRange,
  GenPropertiesSelect,
  // GenPropertiesDrop,
  GenPropertiesNumber,
  GenPropertiesSystemDefined,
  GenPropertiesInputGroup,
  GenPropertiesTextArea,
  GenPropertiesUpload,
  GenDummy,
  GenPropertiesTable,
  GenTextFormula,
  GenWFNext,
  GenPropertiesText,
  GenDropReaction,
} from '@components/fields/GenPropertiesFields';
// import Constants from '@components/tools/Constants';
import PropCalculate from '@components/fields/PropCalculate';
import PropDrop from '@components/fields/PropDrop';
import GenPropSelectMulti from '@components/fields/GenPropSelectMulti';
// import ElementSelectButton from '@components/shared/ElementSelectButton';
import { VOC_MODE, vocMode } from '@/utils/vocUtils';

// const renderDrop = (props) => {
//   const { genericType } = props;
//   console.log('renderDrop props:', props);
//   if (genericType === Constants.GENERIC_TYPES.DATASET) {
//     return <ElementSelectButton {...props} />;
//   }
//   return <GenPropertiesDrop {...props} />;
// };

const readVoc = (field, readonly) => {
  if (vocMode(field) === VOC_MODE.R.value) {
    return true;
  }
  return readonly;
};

const GenProperties = (opt) => {
  const fieldProps = { ...opt, dndItems: [], readOnly: readVoc(opt.f_obj, opt.readOnly), isEditable: !readVoc(opt.f_obj, !opt.isEditable) };
  const [mainType, custom] = fieldProps.type.split('_');
  if (opt.isSearch && mainType === FieldTypes.F_DRAG) mainType = FieldTypes.F_TEXT;
  // if (opt.isPreview && (mainType === 'drag' || mainType === 'upload')) mainType = 'text';
  switch (mainType) {
    case FieldTypes.F_CHECKBOX:
      return GenPropertiesCheckbox(fieldProps);
    case FieldTypes.F_DATETIME:
      return GenPropertiesDate(fieldProps);
    // case 'datetime-range':
    //   return GenPropertiesDateTimeRange(fieldProps);
    case FieldTypes.F_FORMULA_FIELD:
      return PropCalculate(fieldProps);
    case FieldTypes.F_SELECT:
      return GenPropertiesSelect(fieldProps);
    case FieldTypes.F_SELECT_MULTI:
      return GenPropSelectMulti(fieldProps);
    case FieldTypes.F_DRAG:
      fieldProps.dndItems = [...fieldProps.dndItems, custom];
      // return GenPropertiesDrop(fieldProps);
      // return renderDrop(fieldProps);
      return PropDrop(fieldProps);
    case FieldTypes.F_INTEGER:
      return GenPropertiesNumber(fieldProps);
    case FieldTypes.F_SYSTEM_DEFINED:
      return GenPropertiesSystemDefined(fieldProps);
    case FieldTypes.F_INPUT_GROUP:
      return GenPropertiesInputGroup(fieldProps);
    case FieldTypes.F_TEXTAREA:
      return GenPropertiesTextArea(fieldProps);
    case FieldTypes.F_UPLOAD:
      return GenPropertiesUpload(fieldProps);
    case FieldTypes.F_DUMMY:
      return GenDummy();
    case FieldTypes.F_SYS_REACTION:
      return GenDropReaction(fieldProps);
    case FieldTypes.F_TABLE:
      return GenPropertiesTable(fieldProps);
    case FieldTypes.F_TEXT_FORMULA:
      return GenTextFormula(fieldProps);
    case FieldTypes.F_WF_NEXT:
      return GenWFNext(fieldProps);
    default:
      return GenPropertiesText(fieldProps);
  }
};

export default GenProperties;
