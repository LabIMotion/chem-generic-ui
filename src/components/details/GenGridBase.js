/* eslint-disable react/forbid-prop-types */
import { AgGridReact } from 'ag-grid-react';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useRef } from 'react';

const GenGridBase = (props) => {
  const { gridData, gridColumn } = props;
  const gridRef = useRef();
  const defaultDef = useMemo(() => {
    return {
      editable: false,
      sortable: true,
      resizable: true,
      filter: true,
      flex: 1,
      minWidth: 160,
    };
  }, []);

  const autoSizeAll = useCallback(() => {
    gridRef.current.api.sizeColumnsToFit();
  }, []);

  const onGridReady = () => {
    autoSizeAll();
  };

  return (
    <div className="ag-theme-alpine" style={{ width: '100%' }}>
      <AgGridReact
        ref={gridRef}
        rowData={gridData}
        columnDefs={gridColumn}
        defaultColDef={defaultDef}
        domLayout="autoHeight"
        suppressRowClickSelection
        suppressCellFocus
        onGridReady={onGridReady}
      />
    </div>
  );
};

GenGridBase.propTypes = {
  gridData: PropTypes.arrayOf(PropTypes.object).isRequired,
  gridColumn: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default GenGridBase;
