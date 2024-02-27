import { createEnum } from './utils';

export default Object.freeze({
  BTN_AI_LINK: 'link',
  BTN_AI_UNLINK: 'unlink',
  IMG_NOT_AVAILABLE_SVG: '../../../assets/images/no_image.svg',
  NODE_TYPES: createEnum(['Input', 'Output', 'Default'], 'toLowerCase'),
  GENERIC_TYPES: createEnum(['Element', 'Segment', 'Dataset']),
  GRID_THEME: {
    ALPINE: { VALUE: 'ag-theme-alpine', PAGE_SIZE: 6 },
    BALHAM: { VALUE: 'ag-theme-balham', PAGE_SIZE: 10 },
  },
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
});
