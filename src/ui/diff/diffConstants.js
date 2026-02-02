// Color scheme for different types of changes
export const DIFF_COLORS = {
  added: '#d4edda',
  removed: '#f8d7da',
  modified: '#fff3cd',
};

// First-level removal during JSON preprocessing
export const PROPS_TO_REMOVE = [
  'pkg',
  'uuid',
  'klass',
  'identifier',
  '_versionDisplay',
  'id',
];

// Layer-specific removal
export const LAYER_PROPS_TO_REMOVE = ['key', 'wf_position', 'wf_uuid', 'timeRecord'];

// Global renaming map
export const PROPS_TO_RENAME = {
  wf: 'workflow',
  cols: 'columns_per_row',
  color: 'header_color',
  label: 'display_name',
  cond_fields: 'restriction_setting',
  select_options: 'selection_list',
  option_layers: 'selection',
  description: 'hover_information',
  hasOwnRow: 'has_its_own_row',
  col_name: 'column_heading',
  sub_fields: 'content',
  style: 'text_style',
  // value_system: 'default_value'
};

// Field-specific removal based on field type
export const FIELD_PROPS_TO_REMOVE = {
  text: ['position'],
  textarea: ['position', 'place_holder'],
  table: ['position', 'default', 'required', 'text_sub_fields', 'value_system'],
  checkbox: ['position'],
  upload: ['position'],
  datetime: ['position'],
  select: ['position'],
  number: ['position'],
  dummy: ['field'],
};

// Base required for field
const BASE_REQUIRED_PROPS = ['label', 'type', 'description', 'ontology'];

// Type-specific required based on field type
const TYPE_SPECIFIC_REQUIRED_PROPS = {
  text: ['field', 'cols', 'hasOwnRow', 'placeholder', 'readonly', 'required'],
  textarea: ['field', 'cols', 'hasOwnRow'],
  checkbox: ['field', 'cols', 'hasOwnRow'],
  upload: ['field', 'cols', 'hasOwnRow'],
  datetime: ['field', 'cols', 'hasOwnRow'],
  'datetime-range': ['field', 'cols', 'hasOwnRow'],
  'drag-molecule': ['field', 'cols', 'hasOwnRow'],
  'drag-sample': ['field', 'cols', 'hasOwnRow'],
  'drag-element': ['field', 'cols', 'hasOwnRow'],
  'formula-field': [
    'field',
    'cols',
    'hasOwnRow',
    'formula',
    'decimal',
    'canAdjust',
  ],
  'input-group': ['field', 'cols', 'hasOwnRow', 'sub_fields'],
  integer: ['field', 'cols', 'hasOwnRow', 'placeholder', 'required'],
  select: ['field', 'cols', 'hasOwnRow', 'option_layers'],
  'select-multi': ['field', 'cols', 'hasOwnRow', 'option_layers'],
  'system-defined': ['field', 'cols', 'hasOwnRow', 'option_layers'],
  table: ['field', 'cols', 'sub_fields'],
  dummy: ['cols'],
  // sub_fields
  number: ['value'],
};

// Function to generate final required properties for each field type
const generateFinalRequiredProps = (base, typeSpecific) => {
  const result = {};
  Object.entries(typeSpecific).forEach(([type, specificProps]) => {
    const merged = ['field', ...base, ...specificProps]
      .filter((item, index, self) => self.indexOf(item) === index); // remove duplicates
    result[type] = merged;
  });
  return result;
};

// Pre-computed final required properties for each field type
export const REQUIRED_PROPS = generateFinalRequiredProps(BASE_REQUIRED_PROPS, TYPE_SPECIFIC_REQUIRED_PROPS);

// Transformations for display
export const TYPE_TRANSFORMS = {
  'select-multi': 'select (multiple)',
  'input-group': 'input group',
  'text-formula': 'text formula',
  'datetime-range': 'datetime range',
  'drag-molecule': 'drag molecule',
  'drag-sample': 'drag sample',
  'drag-element': 'drag element',
  'formula-field': 'formula field',
  'system-defined': 'system defined',
};

export const HEADER_COLOR_TRANSFORMS = {
  'primary': 'Ocean Blue',
  'info': 'Sky Blue',
  'success': 'Fresh Green',
  'default': 'Grey',
  'danger': 'Crimson',
  'warning': 'Amber',
};

export const HEADER_TEXT_STYLE_TRANSFORMS = {
  'panel_generic_heading': 'bold',
  'panel_generic_heading_bu': 'bold + underline',
  'panel_generic_heading_bui': 'bold + underline + italic',
};

// Grid configuration
export const GRID_CONFIG = {
  defaultColDef: {
    sortable: false,
    filter: false,
  },
  animateRows: true,
  height: 500,
  indentSize: 20, // pixels per level for tree indentation
};
