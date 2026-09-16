// TIB Terminology Service API utilities for ontology tree operations

const TIB_API_BASE = 'https://api.terminology.tib.eu/api';

// Normalize a label that may come back from the API as a string, array of
// strings, or a language-tagged object like { value: 'Foo' }. Always returns
// a plain string so downstream code (search filter, render) can't crash on
// an unexpected shape.
const normalizeLabel = (raw) => {
  if (raw == null) return '';
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (first == null) return '';
  if (typeof first === 'string') return first;
  if (typeof first === 'object') return first.value || '';
  return String(first);
};

// A cached tree is only usable if every node that claims hasChildren actually
// has them. Partial trees can get persisted if a subtree fetch silently failed
// in a prior session; on read we discard those so the next open re-fetches.
export const isTreeComplete = (node) => {
  if (!node) return false;
  if (node.hasChildren && !(node.children && node.children.length > 0)) {
    return false;
  }
  if (node.children && node.children.length > 0) {
    return node.children.every(isTreeComplete);
  }
  return true;
};

/**
 * Parse ontology ID and term IRI from ontology_term field
 * Expected formats:
 * - "ontologyId:class:termIRI" (e.g., "bao:class:http://...")
 * - "ontologyId|termIRI"
 * - just "termIRI"
 */
export const parseOntologyTerm = (ontologyTerm) => {
  if (!ontologyTerm) return { ontologyId: null, termIri: null };

  // Ensure it's a string (support object with .value property)
  const termStr =
    typeof ontologyTerm === 'string'
      ? ontologyTerm
      : ontologyTerm?.value || String(ontologyTerm);

  // Check for "ontologyId:class:termIri" format
  const classMatch = termStr.match(/^([^:]+):class:(.+)$/);
  if (classMatch) {
    return { ontologyId: classMatch[1], termIri: classMatch[2] };
  }

  // Check for "ontologyId|termIRI" format
  const parts = termStr.split('|');
  if (parts.length === 2) {
    return { ontologyId: parts[0], termIri: parts[1] };
  }

  // Try to extract ontology from IRI
  const iriMatch = termStr.match(/obo\/([A-Z]+)_/);
  return {
    ontologyId: iriMatch ? iriMatch[1].toLowerCase() : null,
    termIri: termStr,
  };
};

/**
 * Load a single ontology term from TIB API
 */
export const loadOntologyTerm = async (ontologyId, termIri) => {
  try {
    // Double encode the IRI for TIB API
    const encodedIri = encodeURIComponent(encodeURIComponent(termIri));
    const url = `${TIB_API_BASE}/v2/ontologies/${ontologyId}/classes/${encodedIri}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const term = await response.json();

    const rawDescription = Array.isArray(term.definition)
      ? term.definition[0]
      : term.definition;
    const description =
      rawDescription && typeof rawDescription === 'object'
        ? rawDescription.value || ''
        : rawDescription || '';

    return {
      id: term.iri,
      label: normalizeLabel(term.label),
      value: term.iri,
      description,
      children: [],
      hasChildren: term.hasDirectChildren || false,
    };
  } catch (error) {
    console.error('Failed to load ontology term:', termIri, error);
    return {
      id: termIri,
      label: termIri,
      value: termIri,
      children: [],
      hasChildren: false,
    };
  }
};

/**
 * Load children for a term (with pagination support)
 */
export const loadTermChildren = async (ontologyId, termIri) => {
  const encodedIri = encodeURIComponent(encodeURIComponent(termIri));
  const baseUrl = `${TIB_API_BASE}/v2/ontologies/${ontologyId}/classes/${encodedIri}/children`;
  const allTerms = [];
  let page = 0;
  let totalPages = 1;

  // Fetch all pages. Errors propagate so callers building a full tree can
  // avoid persisting a partial result (see loadAllChildren / cache logic).
  while (page < totalPages) {
    const url = `${baseUrl}?page=${page}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.elements) {
      const terms = data.elements.map((term) => ({
        id: term.iri,
        label: normalizeLabel(term.label),
        value: term.iri,
        description: normalizeLabel(term.definition),
        children: [],
        hasChildren: term.hasDirectChildren || false,
      }));
      allTerms.push(...terms);
    }

    totalPages = data.totalPages || 1;
    page += 1;
  }

  // Sort terms alphabetically by label (case-insensitive)
  allTerms.sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
  );

  return allTerms;
};

/**
 * Recursively load all children for full tree
 */
export const loadAllChildren = async (node, ontologyId) => {
  if (!node.hasChildren) {
    return node;
  }

  const children = await loadTermChildren(ontologyId, node.id);
  if (children.length === 0) {
    // The node advertised children but the server returned none. Treat as a
    // load failure so callers don't persist a partial tree.
    throw new Error(
      `No children returned for term with hasChildren=true: ${node.id}`,
    );
  }
  const childrenWithDescendants = await Promise.all(
    children.map((child) => loadAllChildren(child, ontologyId)),
  );

  // Children are already sorted by loadTermChildren, but ensure they stay sorted
  childrenWithDescendants.sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
  );

  return {
    ...node,
    children: childrenWithDescendants,
  };
};

/**
 * Get ontology tree from cache or load from API
 */
export const getOntologyTree = async (ontologyTerm) => {
  const { ontologyId, termIri } = parseOntologyTerm(ontologyTerm);

  if (!ontologyId || !termIri) {
    console.warn('No valid ontology term found:', ontologyTerm);
    return null;
  }

  // Check localStorage cache first
  const cacheKey = `ontology_tree_${ontologyId}_${encodeURIComponent(termIri)}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      return parsedCache;
    }
  } catch (error) {
    console.warn('Failed to load from cache:', error);
  }

  // Fetch from API if not cached
  const rootData = await loadOntologyTerm(ontologyId, termIri);
  return rootData;
};

/**
 * Save ontology tree to localStorage cache
 */
export const cacheOntologyTree = (ontologyTerm, treeData) => {
  const { ontologyId, termIri } = parseOntologyTerm(ontologyTerm);

  if (ontologyId && termIri) {
    const cacheKey = `ontology_tree_${ontologyId}_${encodeURIComponent(termIri)}`;
    try {
      localStorage.setItem(cacheKey, JSON.stringify(treeData));
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  }
};

/**
 * Clear ontology tree from localStorage cache
 */
export const clearOntologyCache = (ontologyTerm) => {
  const { ontologyId, termIri } = parseOntologyTerm(ontologyTerm);

  if (ontologyId && termIri) {
    const cacheKey = `ontology_tree_${ontologyId}_${encodeURIComponent(termIri)}`;
    localStorage.removeItem(cacheKey);
    return true;
  }
  return false;
};
