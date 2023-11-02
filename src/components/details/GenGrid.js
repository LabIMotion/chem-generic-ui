/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import { differenceWith, toPairs, isEqual } from 'lodash';

const defaultColDef = {
  editable: false,
  sortable: true,
  resizable: true,
  filter: true,
  flex: 1,
  minWidth: 100,
};

class GenGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      columnDefs: props.columnDefs,
    };
  }

  componentDidUpdate(prevProps) {
    const { gridData, pageSize, theme } = this.props;
    const updated =
      theme !== prevProps.theme ||
      pageSize !== prevProps.pageSize ||
      gridData?.length !== prevProps.gridData?.length;
    if (gridData !== prevProps.gridData || updated) {
      if (this.gridApi) {
        const selectedRows = this.gridApi.getSelectedRows();
        const selected = selectedRows[0];
        const changes = differenceWith(
          toPairs(gridData),
          toPairs(prevProps.gridData),
          isEqual
        );
        if (changes.length > 0 || updated) {
          this.gridApi.setRowData(gridData);
          if (selected) {
            this.gridApi.forEachNode(node => {
              node.setSelected(node.data.id === selected.id);
            });
          }
        }
      }
    }
  }

  onGridReady = params => {
    const { gridData } = this.props;
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    params.api.setRowData(gridData);
  };

  render() {
    const { pageSize, theme } = this.props;
    const { columnDefs } = this.state;
    return (
      <div style={{ height: '33vh', width: '100%' }}>
        <div style={{ height: '100%', width: '100%' }} className={theme}>
          <AgGridReact
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            suppressRowClickSelection // https://www.ag-grid.com/react-data-grid/row-selection/
            suppressCellFocus // https://www.ag-grid.com/react-data-grid/grid-options/#reference-selection
            rowSelection="single"
            pagination={false} // disabled pagination & do not set domLayout="autoHeight"
            paginationPageSize={pageSize}
            onGridReady={this.onGridReady}
            rowData={null}
          />
        </div>
      </div>
    );
  }
}

GenGrid.propTypes = {
  columnDefs: PropTypes.array.isRequired,
  gridData: PropTypes.array.isRequired,
  pageSize: PropTypes.number,
  theme: PropTypes.string,
};

GenGrid.defaultProps = { pageSize: 10, theme: 'ag-theme-balham' };

export default GenGrid;
