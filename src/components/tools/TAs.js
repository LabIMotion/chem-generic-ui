import React from 'react';
import capFirst from './format-utils';

export default Object.freeze({
  adjust_calculation: 'Adjust the calculation',
  add_entry: 'Add an entry',
  add_layer: 'Add a layer',
  add_std_layer: 'Add this layer to the Layer Standards',
  add_vocabulary: 'Add into Vocabulary',
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
  draw_flow: 'Draw a workflow',
  edit_attr: (_in) => `Edit ${capFirst(_in)} attributes`,
  edit_layer_attr: (_in) => `Edit layer [${_in}] attributes`,
  export_docx: 'Export as docx file',
  flow_defined: 'A workflow is defined',
  grid_large: 'Enlarge grid size',
  grid_small: 'Shrink grid size',
  imp_element_n_temp: 'Import a element and its template',
  imp_segment_n_temp: 'Import a segment and its template',
  imp_dataset_n_temp: 'Import a dataset and its template',
  imp_temp_to_area: 'Import a Template into the Work Area',
  link_term: (_in) => (
    <>
      {_in} <br /> What is this?
    </>
  ),
  preview_or_versions: 'Click to preview or view version history',
  record_time: 'Record the time',
  reload_temp: 'Click to reload the template',
  remove: 'Remove',
  remove_molecule: 'Remove this molecule',
  restriction_setting: 'Restriction Setting',
});
