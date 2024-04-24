import { FieldTypes } from 'generic-ui-core';
import {
  GenPropertiesCheckbox,
  GenPropertiesCalculate,
  GenPropertiesDate,
  GenPropertiesDateTimeRange,
  GenPropertiesSelect,
  GenPropertiesDrop,
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
} from './GenPropertiesFields';
import PropCalculate from './PropCalculate';

const GenProperties = opt => {
  const fieldProps = { ...opt, dndItems: [] };
  const type = fieldProps.type.split('_');
  if (opt.isSearch && type[0] === 'drag') type[0] = 'text';
  // if (opt.isPreview && (type[0] === 'drag' || type[0] === 'upload')) type[0] = 'text';
  switch (type[0]) {
    case 'checkbox':
      return GenPropertiesCheckbox(fieldProps);
    case FieldTypes.F_DATETIME:
      return GenPropertiesDate(fieldProps);
    // case 'datetime-range':
    //   return GenPropertiesDateTimeRange(fieldProps);
    case FieldTypes.F_FORMULA_FIELD:
      return PropCalculate(fieldProps);
    case 'select':
      return GenPropertiesSelect(fieldProps);
    case 'drag':
      fieldProps.dndItems = [...fieldProps.dndItems, type[1]];
      return GenPropertiesDrop(fieldProps);
    case 'integer':
      return GenPropertiesNumber(fieldProps);
    case 'system-defined':
      return GenPropertiesSystemDefined(fieldProps);
    case 'input-group':
      return GenPropertiesInputGroup(fieldProps);
    case 'textarea':
      return GenPropertiesTextArea(fieldProps);
    case 'upload':
      return GenPropertiesUpload(fieldProps);
    case 'dummy':
      return GenDummy();
    case 'sys-reaction':
      return GenDropReaction(fieldProps);
    case 'table':
      return GenPropertiesTable(fieldProps);
    case 'text-formula':
      return GenTextFormula(fieldProps);
    case 'wf-next':
      return GenWFNext(fieldProps);
    default:
      return GenPropertiesText(fieldProps);
  }
};

export default GenProperties;
