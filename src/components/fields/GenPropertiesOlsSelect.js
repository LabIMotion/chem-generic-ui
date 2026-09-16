import React, { useState, useCallback, useEffect } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import FieldHeader from '@components/fields/FieldHeader';
import FIcons from '@components/icons/FIcons';
import { fieldCls } from '@components/tools/utils';
import {
  parseOntologyTerm,
  loadOntologyTerm,
  loadTermChildren,
  loadAllChildren,
  cacheOntologyTree,
  clearOntologyCache,
  isTreeComplete,
} from '@utils/ontologyApi';
import GModal from '@ui/modals/GModal';

function GenPropertiesOlsSelect(opt) {
  const [treeData, setTreeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [loadedChildren, setLoadedChildren] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const treeLoadStartedRef = React.useRef(false);
  const klz = fieldCls(opt.isSpCall);

  // Derive a stable key for the active ontology term so the fetch effect
  // re-runs when the caller swaps f_obj (e.g. switching restriction fields).
  const ontologyTerm =
    opt.f_obj?.ontology_term || opt.ontology_term || opt.options;
  const { ontologyId: activeOntologyId, termIri: activeTermIri } =
    parseOntologyTerm(ontologyTerm);
  const termKey = `${activeOntologyId || ''}::${activeTermIri || ''}`;

  // Fetch ontology tree hierarchy based on the ontology_term field
  useEffect(() => {
    const fetchOntologyTree = async () => {
      // Reset dependent state whenever the term changes so stale tree/selection
      // from the previous term doesn't leak into the new one.
      setExpanded({});
      setLoadedChildren({});
      setSelectedNode(null);
      treeLoadStartedRef.current = false;

      if (!activeOntologyId || !activeTermIri) {
        console.warn('No valid ontology term found:', ontologyTerm);
        setTreeData([]);
        return;
      }

      // Check localStorage cache first. Reject incomplete trees (a node
      // advertising hasChildren with an empty children array) so we re-fetch
      // instead of serving a stale/partial tree that would make search miss.
      const cacheKey = `ontology_tree_${activeOntologyId}_${encodeURIComponent(activeTermIri)}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          if (isTreeComplete(parsedCache)) {
            setTreeData([parsedCache]);
            return;
          }
          localStorage.removeItem(cacheKey);
        }
      } catch (error) {
        console.warn('Failed to load from cache:', error);
      }

      setLoading(true);
      try {
        // Fetch root term
        const rootData = await loadOntologyTerm(
          activeOntologyId,
          activeTermIri,
        );
        setTreeData([rootData]);
      } catch (error) {
        console.error('Failed to load ontology tree:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOntologyTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termKey, refreshTrigger]);

  // Handle node expansion to load children
  const handleExpand = async (nodeId, node) => {
    if (expanded[nodeId]) {
      // Collapse node
      setExpanded((prev) => ({ ...prev, [nodeId]: false }));
      return;
    }

    // Expand node
    setExpanded((prev) => ({ ...prev, [nodeId]: true }));

    // Load children if not already loaded
    if (!loadedChildren[nodeId] && node.hasChildren) {
      const { ontologyId } = parseOntologyTerm(ontologyTerm);
      if (!ontologyId) return;

      let children;
      try {
        children = await loadTermChildren(ontologyId, nodeId);
      } catch (error) {
        console.error('Failed to load children for node:', nodeId, error);
        return;
      }
      setLoadedChildren((prev) => ({ ...prev, [nodeId]: true }));

      // Update tree data with loaded children
      setTreeData((prevData) => {
        const updateNode = (nodes) =>
          nodes.map((n) => {
            if (n.id === nodeId) {
              return { ...n, children };
            }
            if (n.children?.length > 0) {
              return { ...n, children: updateNode(n.children) };
            }
            return n;
          });
        return updateNode(prevData);
      });
    }
  };

  // Handle selection
  const handleSelect = (node) => {
    if (opt.readOnly) return;

    // Create a synthetic event object that mimics a form control's onChange event
    // The parent component expects event.target.value
    const syntheticEvent = {
      target: {
        value: node.label,
        name: opt.field,
      },
    };
    opt.onChange(syntheticEvent);
    setShowModal(false);
  };

  // Handle clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    if (opt.readOnly) return;

    const syntheticEvent = {
      target: {
        value: null,
        name: opt.field,
      },
    };
    opt.onChange(syntheticEvent);
  };

  // Handle cache refresh
  const handleRefreshCache = () => {
    if (clearOntologyCache(ontologyTerm)) {
      // Reset tree to trigger reload
      treeLoadStartedRef.current = false;
      setTreeData([]);
      setExpanded({});
      setLoadedChildren({});

      // Trigger reload by incrementing refreshTrigger
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  // Find and expand path to selected value
  const findAndExpandPath = useCallback((nodes, targetLabel, path = []) => {
    let result = null;
    nodes.forEach((node) => {
      if (result) return; // Skip if already found
      const currentPath = [...path, node.id];
      if (node.label === targetLabel) {
        result = currentPath;
        return;
      }
      if (node.children?.length > 0) {
        const found = findAndExpandPath(
          node.children,
          targetLabel,
          currentPath,
        );
        if (found) result = found;
      }
    });
    return result;
  }, []);

  // Load full tree and auto-expand when modal opens
  useEffect(() => {
    if (!showModal) return;

    const loadFullTreeAndExpand = async () => {
      // Get ontology info
      const { ontologyId } = parseOntologyTerm(ontologyTerm);

      if (!ontologyId || treeData.length === 0) return;

      // Guard against re-entry: once load has started, don't trigger again
      if (treeLoadStartedRef.current) return;
      treeLoadStartedRef.current = true;

      // Check if we need to load children (tree only has root or has unexpanded nodes)
      const hasLoadedChildren = treeData[0]?.children?.length > 0;

      if (!hasLoadedChildren) {
        setLoading(true);
        try {
          // Load full tree recursively
          const fullTree = await loadAllChildren(treeData[0], ontologyId);
          setTreeData([fullTree]);

          // Save to localStorage cache
          cacheOntologyTree(ontologyTerm, fullTree);

          // Mark all children as loaded
          const allLoaded = {};
          const markAllLoaded = (node) => {
            allLoaded[node.id] = true;
            if (node.children) {
              node.children.forEach(markAllLoaded);
            }
          };
          markAllLoaded(fullTree);
          setLoadedChildren(allLoaded);
        } catch (error) {
          console.error('Failed to load full tree:', error);
          treeLoadStartedRef.current = false; // Allow retry on error
        } finally {
          setLoading(false);
        }
      }
    };

    loadFullTreeAndExpand();
  }, [showModal, treeData, opt.f_obj, opt.ontology_term, opt.options]);

  // Auto-expand to show selected value after tree is loaded
  useEffect(() => {
    if (
      showModal &&
      opt.value &&
      treeData.length > 0 &&
      treeData[0]?.children?.length > 0
    ) {
      const path = findAndExpandPath(treeData, opt.value);
      if (path) {
        const expandObj = {};
        path.forEach((nodeId) => {
          expandObj[nodeId] = true;
        });
        setExpanded(expandObj);

        // Scroll to selected node after a brief delay
        setTimeout(() => {
          const selectedElement = document.querySelector('[style*="#e3f2fd"]');
          if (selectedElement) {
            selectedElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }, 100);
      }
    }
  }, [showModal, opt.value, treeData, findAndExpandPath]);

  // Filter tree nodes based on search
  const filterNodes = useCallback((nodes, filter) => {
    if (!filter) return nodes;

    const lowerFilter = filter.toLowerCase();
    const filtered = [];

    const searchNode = (node) => {
      const matches = node.label.toLowerCase().includes(lowerFilter);
      const filteredChildren =
        node.children?.map(searchNode).filter(Boolean) || [];

      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
      return null;
    };

    nodes.forEach((node) => {
      const result = searchNode(node);
      if (result) filtered.push(result);
    });

    return filtered;
  }, []);

  // Auto-expand filtered nodes
  useEffect(() => {
    if (searchFilter && treeData.length > 0) {
      const expandAll = (nodes) => {
        const expandObj = {};
        const traverse = (node) => {
          if (node.children?.length > 0) {
            expandObj[node.id] = true;
            node.children.forEach(traverse);
          }
        };
        nodes.forEach(traverse);
        return expandObj;
      };
      const filteredData = filterNodes(treeData, searchFilter);
      setExpanded(expandAll(filteredData));
    }
  }, [searchFilter, treeData, filterNodes]);

  // Render tree node
  const renderTreeNode = (node, level = 0) => (
    <div key={node.id} style={{ marginLeft: `${level * 20}px` }}>
      <div
        style={{
          padding: '5px',
          cursor: opt.readOnly ? 'default' : 'pointer',
          backgroundColor:
            opt.value && opt.value === node.label ? '#e3f2fd' : 'transparent',
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseEnter={() => setSelectedNode(node)}
      >
        {node.hasChildren && (
          <span
            role="button"
            tabIndex={0}
            onClick={() => handleExpand(node.id, node)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ')
                handleExpand(node.id, node);
            }}
            style={{ marginRight: '5px', cursor: 'pointer' }}
          >
            {expanded[node.id] ? '▼' : '▶'}
          </span>
        )}
        <span
          role="button"
          tabIndex={0}
          onClick={() => handleSelect(node)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') handleSelect(node);
          }}
        >
          {node.label}
        </span>
      </div>
      {expanded[node.id] &&
        node.children?.map((child) => renderTreeNode(child, level + 1))}
    </div>
  );

  const filteredTreeData = filterNodes(treeData, searchFilter);

  return (
    <>
      <Form.Group className={klz[0]}>
        {FieldHeader(opt)}
        <span
          className={klz[1]}
          style={{ position: 'relative', display: 'block' }}
        >
          <Form.Control
            readOnly
            value={opt.value && typeof opt.value === 'string' ? opt.value : ''}
            placeholder="Select ontology term..."
            title={
              opt.value && typeof opt.value === 'string'
                ? opt.value
                : 'Select ontology term...'
            }
            disabled={opt.readOnly}
            onClick={() => !opt.readOnly && setShowModal(true)}
            style={{
              cursor: opt.readOnly ? 'not-allowed' : 'pointer',
              textOverflow: 'ellipsis',
              paddingRight: opt.value && !opt.readOnly ? '30px' : undefined,
            }}
          />
          {opt.value && !opt.readOnly && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleClear(e);
              }}
              title="Clear selection"
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#999',
                lineHeight: '1',
              }}
            >
              ×
            </span>
          )}
        </span>
      </Form.Group>

      <GModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSearchFilter('');
        }}
        size="xl"
      >
        <GModal.Header>
          <GModal.Title
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <span>Select Ontology Term</span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleRefreshCache}
              title="Fetch the latest terms from the ontology server. Use this if you suspect the tree is out of date or a term is missing."
            >
              {FIcons.faArrowsRotate}&nbsp;Refresh
            </Button>
            <div
              className="alert alert-primary fw-normal p-2 mb-0"
              style={{ fontSize: 'small' }}
            >
              {FIcons.faCircleInfo}&nbsp;Reload the data from the ontology
              server if a term is missing.
            </div>
          </GModal.Title>
        </GModal.Header>
        <GModal.Body style={{ minHeight: '500px' }}>
          <div style={{ marginBottom: '15px' }}>
            <Form.Control
              type="text"
              placeholder="Search terms..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              autoFocus
            />
          </div>
          <Row>
            <Col
              md={7}
              style={{
                maxHeight: '500px',
                overflowY: 'auto',
                borderRight: '1px solid #dee2e6',
              }}
            >
              {loading && <div>Loading ontology tree...</div>}
              {!loading && filteredTreeData.length === 0 && searchFilter && (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#999',
                  }}
                >
                  No matching terms found
                </div>
              )}
              {!loading &&
                (filteredTreeData.length > 0 || !searchFilter) &&
                filteredTreeData.map((node) => renderTreeNode(node))}
            </Col>
            <Col
              md={5}
              style={{
                paddingLeft: '20px',
                maxHeight: '500px',
                overflowY: 'auto',
              }}
            >
              {selectedNode ? (
                (() => {
                  // Defensive: ensure description is always a string
                  let desc = selectedNode.description;
                  if (desc && typeof desc === 'object') {
                    desc = desc.value || '';
                  }
                  return (
                    <>
                      <h6 style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                        {selectedNode.label}
                      </h6>
                      {desc ? (
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          <strong>Definition:</strong>
                          <p style={{ marginTop: '8px' }}>{desc}</p>
                        </div>
                      ) : (
                        <div
                          style={{
                            fontSize: '14px',
                            color: '#999',
                            fontStyle: 'italic',
                          }}
                        >
                          No definition available for this term.
                        </div>
                      )}
                    </>
                  );
                })()
              ) : (
                <div
                  style={{
                    fontSize: '14px',
                    color: '#999',
                    fontStyle: 'italic',
                  }}
                >
                  Hover over a term to see its definition.
                </div>
              )}
            </Col>
          </Row>
        </GModal.Body>
        <GModal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowModal(false);
              setSearchFilter('');
            }}
          >
            Close
          </Button>
        </GModal.Footer>
      </GModal>
    </>
  );
}

export default GenPropertiesOlsSelect;
