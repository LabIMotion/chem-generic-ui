import { createEnum } from '@utils/pureUtils';

export default Object.freeze({
  BTN_AI_LINK: 'link',
  BTN_AI_UNLINK: 'unlink',
  IMG_NOT_AVAILABLE_SVG: '@assets/images/no_image.svg',
  NODE_TYPES: createEnum(['Input', 'Output', 'Default'], 'toLowerCase'),
  GENERIC_TYPES: createEnum([
    'Element',
    'Segment',
    'Dataset',
    'Layer',
    'Vocabulary',
  ]),
  GENERIC_KLASS_TYPES: createEnum([
    'ElementKlass',
    'SegmentKlass',
    'DatasetKlass',
  ]),
  GRID_THEME: {
    ALPINE: { VALUE: 'ag-theme-alpine', PAGE_SIZE: 6 },
    BALHAM: { VALUE: 'ag-theme-balham', PAGE_SIZE: 10 },
    QUARTZ: { VALUE: 'ag-theme-quartz', PAGE_SIZE: 6 },
  },
  MODEL_TYPES: createEnum(['GenericEl', 'Segment', 'Container']),
  SYS_REACTION: 'REACTION-',
  OLS_EBI: {
    BASE: 'https://www.ebi.ac.uk/ols4/api/select',
    PARAM: [
      'rows=20',
      'collection=efo',
      'obsoletes=false',
      'local=false',
      'fieldList=id,iri,label,short_form,obo_id,ontology_name,ontology_prefix,description,type',
    ].join('&'),
  },
  OLS_TIB: {
    BASE: 'https://service.tib.eu/ts4tib/api/select',
    PARAM: [
      'rows=20',
      'collection=nfdi4chem',
      'obsoletes=false',
      'local=false',
      'fieldList=id,iri,label,short_form,obo_id,ontology_name,ontology_prefix,description,type',
    ].join('&'),
  },
  MYDB: 'mydb',
  PERMIT_TARGET: {
    // CELL_LINE: 'cell_line',
    DEVICE_DESCRIPTION: 'device_description',
    ELEMENT: 'element',
    REACTION: 'reaction',
    RESEARCH_PLAN: 'research_plan',
    SCREEN: 'screen',
    WELLPLATE: 'wellplate',
    GENERIC_GRID: 'generic_grid',
    MOLECULE: 'molecule',
    SAMPLE: 'sample',
  },
  PROPS_RELEASE: 'properties_release',
  SEPARATOR_TAG: '@@',
});
