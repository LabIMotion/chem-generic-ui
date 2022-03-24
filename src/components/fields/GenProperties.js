import {
  GenPropertiesCheckbox,
  GenPropertiesCalculate,
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
  GenPropertiesText
} from './GenPropertiesFields';

const GenProperties = (opt) => {
  const fieldProps = { ...opt, dndItems: [] };
  const type = fieldProps.type.split('_');
  if (opt.isSearch && type[0] === 'drag') type[0] = 'text';
  // if (opt.isPreview && (type[0] === 'drag' || type[0] === 'upload')) type[0] = 'text';
  switch (type[0]) {
    case 'checkbox':
      return GenPropertiesCheckbox(fieldProps);
    case 'formula-field':
      return GenPropertiesCalculate(fieldProps);
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
