/* eslint-disable react/forbid-prop-types */
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { Form } from 'react-bootstrap';
import Constants from '../tools/Constants';

const defaultColDef = {
  minWidth: 50,
  width: 150,
  filter: false,
  sortable: true,
};

const GenGrid = ({ columnDefs, gridData, pageSize, theme }) => {
  const [columns] = useState(columnDefs);
  const qfRef = useRef();
  const gridRef = useRef();
  const gridStyle = useMemo(() => ({ height: '100%', width: '100%' }), []);
  const [rowData, setRowData] = useState(gridData || []);
  const selectedIdRef = useRef(null);

  useEffect(() => {
    const currentSelected = gridRef?.current?.api?.getSelectedRows()?.[0];
    if (currentSelected?.id) {
      selectedIdRef.current = currentSelected.id;
    }
    setRowData(gridData);
    requestAnimationFrame(() => {
      if (selectedIdRef.current && gridRef?.current?.api) {
        gridRef.current.api.forEachNode((node) => {
          if (node.data.id === selectedIdRef.current) {
            node.setSelected(true);
          }
        });
      }
    });
  }, [gridData]);

  const onFilterTextBoxChanged = useCallback(() => {
    gridRef.current.api.setGridOption('quickFilterText', qfRef.current.value);
  }, []);

  return (
    <>
      <div className="mb-2">
        <Form>
          <Form.Control
            ref={qfRef}
            placeholder="Enter text to filter..."
            onChange={onFilterTextBoxChanged}
          />
        </Form>
      </div>
      <div style={{ height: '33vh', width: '100%' }}>
        <div style={gridStyle} className={theme}>
          <AgGridReact
            ref={gridRef}
            columnDefs={columns}
            defaultColDef={defaultColDef}
            rowSelection={{
              mode: 'singleRow',
              checkboxes: false,
              enableClickSelection: true,
            }}
            paginationPageSize={pageSize}
            rowData={rowData}
          />
        </div>
      </div>
    </>
  );
};

GenGrid.propTypes = {
  columnDefs: PropTypes.array.isRequired,
  gridData: PropTypes.array.isRequired,
  pageSize: PropTypes.number,
  theme: PropTypes.string,
};

GenGrid.defaultProps = {
  pageSize: Constants.GRID_THEME.BALHAM.PAGE_SIZE,
  theme: Constants.GRID_THEME.BALHAM.VALUE,
};

export default GenGrid;
