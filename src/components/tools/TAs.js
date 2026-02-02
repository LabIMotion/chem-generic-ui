import React from 'react';
import { capFirst } from '@components/tools/format-utils';

export default Object.freeze({
  adjust_calculation: 'Adjust the calculation',
  add_entry: 'Add an entry',
  add_layer: 'Add a layer',
  arrange_field: 'Arrange fields order',
  arrange_layer: 'Arrange layers order',
  arrange_group_layer: 'Arrange groups & layers order',
  associate_direct: 'Associate with this sample',
  associate_duplicate: 'Duplicate the sample first and then associate with it',
  associate_split: 'Split from the sample first and then associate with it',
  change_position: 'Change position via drag and drop',
  chmo_changed: (
    <>
      Type (Chemical Methods Ontology) has been changed.
      <br />
      Please review this dataset content.
    </>
  ),
  clipboard: 'Copy to clipboard',
  clipboard_copied: 'Copied!',
  close: 'Close window',
  copy: (_in) => `Copy ${capFirst(_in)} to ...`,
  copy_to_duration: (
    <>
      use this duration
      <br />
      (rounded to precision 1)
    </>
  ),
  create: (_in) => `Create a new ${capFirst(_in)}`,
  create_element: 'Create a new Element',
  create_segment: 'Create a new Segment',
  create_dataset: 'Create a new Dataset',
  design_flow: 'Design a workflow',
  design_template: 'Click to design the template',
  docs: 'Documentation',
  draw_flow: 'Draw a custom workflow',
  dtl_expand: 'Expand details',
  dtl_collapse: 'Collapse details',
  edit_attr: (_in) => `Edit ${capFirst(_in)} attributes`,
  edit_layer_attr: (_in) => `Edit layer [${_in}] attributes`,
  export_docx: 'Export as docx file',
  export_tbl_xlsx: 'Export table as xlsx file',
  fl_defined: 'A workflow is defined',
  fl_view: 'View the predefined workflow',
  fld_add: 'Add a new field',
  fld_dum_add: 'Add a dummy field',
  grid_large: 'Enlarge grid size',
  grid_small: 'Shrink grid size',
  group_layer: 'Group layers and set conditions',
  link_element: 'Select an element to link it to this record',
  imp_element_n_temp: 'Import a element and its template',
  imp_segment_n_temp: 'Import a segment and its template',
  imp_dataset_n_temp: 'Import a dataset and its template',
  imp_temp_to_area: 'Import a Template into the Work Area',
  link_term: (_in) => (
    <>
      {_in} <br /> What is this?
    </>
  ),
  lyr_add2std: 'Add this layer to Standard Layer',
  lyr_add2tpl: 'Add this layer to the template',
  lyr_view: 'View this Layer',
  more_func: 'More functions',
  mv_up: 'Move Up',
  mv_down: 'Move Down',
  no_unit_conversion: [
    "Units like 'Electrical potential' (V vs. CE, V vs. RE)",
    'and',
    "'Specific current' (mA/g, mA/cm²) won’t be converted.",
  ].join(' '),
  preview_or_versions: 'Click to preview or view version history',
  sel_add: 'Add a new selection list',
  sel_lyr2tpl: (
    <>
      Select from the Standard Layer and
      <br />
      apply it in the template
    </>
  ),
  sel_voc2tpl: (
    <>
      Select from the LabIMotion Vocabulary (Lab-Vocab) and
      <br />
      apply it in the template
    </>
  ),
  sel_opt_add: 'Add an option',
  scn_full: 'Full screen',
  scn_full_exit: 'Exit full screen',
  tpl_act: 'Activate this template (currently inactive)',
  tpl_de_act: 'De-activate this template (currently active)',
  tpl_edit: 'Edit this template',
  tpl_fetch: 'Fetch this template from Template Hub',
  tpl_ver_info: 'View version information',
  tpl_view_hub: 'View all templates in Template Hub',
  tpl_save_rel_major: (
    <>
      Save and Release template as major version
      <br />
      (version number X.Y, X is the major version)
    </>
  ),
  tpl_save_rel_minor: (
    <>
      Save and Release template as minor version
      <br />
      (version number X.Y, Y is the minor version)
    </>
  ),
  tpl_save_draft: 'Save as Draft',
  record_time: 'Record the time',
  reload_temp: 'Click to reload the template',
  remove: 'Remove',
  remove_molecule: 'Remove this molecule',
  restriction_setting: 'Restriction Setting',
  restric_not_on_required: 'This required field cannot have restrictions.',
  return_to_list: 'Back to list',
  ver_download: 'Download this version',
  ver_retrieve: 'Retrieve this version',
  ver_view: 'View this version',
  voc_add: 'Add this into LabIMotion Vocabulary (Lab-Vocab)',
  voc_add2tpl: 'Add this LabIMotion Vocabulary (Lab-Vocab) to the template',
});
