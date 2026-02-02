/* eslint-disable react/forbid-prop-types */
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import Select from 'react-select';
import Constants from '@components/tools/Constants';
import VerManager from '@utils/verMgr';
import { frmSelSty } from '@components/tools/utils';

const permitTargets = Object.values(Constants.PERMIT_TARGET);

/**
 * Modal component for searching and selecting elements
 * Displays a searchable grid with element data
 */
const ElementSelectModal = ({ show, onHide, onSelect }) => {
  const [elements, setElements] = useState([]);
  const [filteredElements, setFilteredElements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [name, setName] = useState('');
  const [shortLabelFilter, setShortLabelFilter] = useState('');
  const [limit, setLimit] = useState(20);
  const [errors, setErrors] = useState({});
  const gridRef = useRef();

  // Fetch all elements when modal opens
  useEffect(() => {
    if (show) {
      fetchElements();
    }
  }, [show]);

  const fetchElements = async () => {
    setLoading(true);
    try {
      const res = await VerManager.listELKlass({ is_active: true });
      if (res.notify?.isSuccess) {
        const activeELs = sortBy(
          (res.element?.data?.klass || []).filter(
            (el) => el.is_generic || permitTargets.includes(el.name),
          ),
          'label',
        );
        setElements(activeELs);
      } else {
        console.error('Failed to fetch elements:', res.error);
        setElements([]);
      }
    } catch (error) {
      console.error('Error fetching elements:', error);
      setElements([]);
    } finally {
      setLoading(false);
    }
  };

  // Build element options for dropdown
  const elementOptions = useMemo(() => {
    return elements.map((klass) => ({
      value: klass.name,
      label: klass.label,
      klass: klass,
    }));
  }, [elements]);

  // Filter elements based on search criteria
  const handleSearch = useCallback(async () => {
    const newErrors = {};

    // Validation
    if (!selectedElement) {
      newErrors.element = 'Element selection is required';
    }

    if (shortLabelFilter.trim() && shortLabelFilter.trim().length < 3) {
      newErrors.shortLabel = 'Short Label must be at least 3 characters';
    }

    if (name.trim() && name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    // For research_plan, name is always required because short_label means nothing to it
    if (selectedElement?.value === 'research_plan') {
      if (!name.trim()) {
        newErrors.name = 'Name is required for research plans';
      }
    } else {
      // At least one of name or shortLabelFilter is required for other elements
      if (!name.trim() && !shortLabelFilter.trim()) {
        newErrors.search = 'At least one of Name or Short Label is required';
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const res = await VerManager.dispatchListELby({
        name: name,
        short_label: shortLabelFilter,
        selected_klass: selectedElement,
        limit: 20,
      });
      console.log('Search elements result:', res);
      if (res.notify?.isSuccess) {
        setFilteredElements(res.element?.data?.elements || []);
      } else {
        console.error('Failed to search elements:', res.error);
        setFilteredElements([]);
      }
    } catch (error) {
      console.error('Error searching elements:', error);
      setFilteredElements([]);
    }
  }, [selectedElement, shortLabelFilter, name, elements]);

  // Reset filters
  const handleReset = () => {
    setSelectedElement(null);
    setShortLabelFilter('');
    setName('');
    setFilteredElements([]);
    setErrors({});
  };

  // Handle row selection
  const handleRowSelect = useCallback(
    (params) => {
      if (params.node.isSelected()) {
        const selected = params.data;
        onSelect(selected);
        handleClose();
      }
    },
    [onSelect],
  );

  // Close modal and reset state
  const handleClose = useCallback(() => {
    handleReset();
    onHide();
  }, [onHide, handleReset]);

  // Column definitions for AG Grid
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Element',
        field: 'klass_label',
        sortable: false,
        flex: 1,
      },
      {
        headerName: 'Name',
        field: 'name',
        sortable: true,
        flex: 2,
      },
      {
        headerName: 'Short Label',
        field: 'short_label',
        sortable: true,
        flex: 1,
      },
      {
        headerName: 'Action',
        field: 'id',
        sortable: false,
        width: 120,
        cellRenderer: (params) => {
          return (
            <Button
              variant="primary"
              size="xsm"
              onClick={() => {
                onSelect(params.data);
                handleClose();
              }}
            >
              Select
            </Button>
          );
        },
      },
    ],
    [onSelect, handleClose],
  );

  const defaultColDef = useMemo(
    () => ({
      minWidth: 100,
      filter: false,
      sortable: true,
      resizable: true,
    }),
    [],
  );

  return (
    show && (
      <>
        <div
          className="modal-backdrop fade show"
          style={{
            zIndex: 1055, // slightly higher than Modal-A backdrop (default 1040)
          }}
        >
          <Modal
            show={show}
            onHide={handleClose}
            size="xl"
            centered
            backdrop="static"
            enforceFocus={true}
          >
            <Modal.Header closeButton>
              <Modal.Title>Link Element</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {Object.keys(errors).length > 0 && (
                <Alert variant="danger" className="mb-3">
                  {errors.element && <div>{errors.element}</div>}
                  {errors.search && <div>{errors.search}</div>}
                  {errors.shortLabel && <div>{errors.shortLabel}</div>}
                  {errors.name && <div>{errors.name}</div>}
                </Alert>
              )}
              {/* Search Criteria */}
              <Row className="mb-3 align-items-end">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Element</Form.Label>
                    <Select
                      styles={frmSelSty}
                      isClearable
                      options={elementOptions}
                      value={selectedElement}
                      onChange={setSelectedElement}
                      placeholder="select from element..."
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="(case-insensitive like search)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Short Label</Form.Label>
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="(case-insensitive like search)"
                      value={shortLabelFilter}
                      onChange={(e) => setShortLabelFilter(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={1}>
                  <Form.Group>
                    <Form.Label>Results</Form.Label>
                    <Form.Control
                      disabled
                      type="text"
                      size="sm"
                      placeholder="20"
                      value={limit}
                      onChange={(e) => setLimit(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Button
                      variant="primary"
                      onClick={handleSearch}
                      className="me-2"
                      size="sm"
                    >
                      Search
                    </Button>
                    <Button variant="secondary" onClick={handleReset} size="sm">
                      Reset
                    </Button>
                  </Form.Group>
                </Col>
              </Row>

              {/* Results Grid */}
              <div
                className={Constants.GRID_THEME.BALHAM.VALUE}
                style={{ height: '400px', width: '100%', overflow: 'auto' }}
              >
                <AgGridReact
                  ref={gridRef}
                  rowData={filteredElements}
                  columnDefs={columnDefs}
                  defaultColDef={defaultColDef}
                  loading={loading}
                  rowSelection={{
                    mode: 'singleRow',
                    checkboxes: false,
                    enableClickSelection: false,
                  }}
                  onRowClicked={handleRowSelect}
                  suppressAutoSize={false}
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="justify-content-start">
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </>
    )
  );
};

ElementSelectModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ElementSelectModal;
