import ts4 from './ts.json';

const buildTS = _ontology => {
  if (!_ontology || typeof _ontology !== 'object') return null;
  const { iri, ontology_prefix: ontologyPrefix, type } = _ontology;
  if (!iri || !ontologyPrefix || !type || !ts4.map[type]) return null;
  const encodedIRI = encodeURIComponent(iri);
  return `${ts4.baseUrl}/${ontologyPrefix}/${ts4.map[type]}?iri=${encodedIRI}`;
};

export default buildTS;
