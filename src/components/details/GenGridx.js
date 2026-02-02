/* eslint-disable react/forbid-prop-types */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AgGridReact } from 'ag-grid-react';
import differenceWith from 'lodash/differenceWith';
import isEqual from 'lodash/isEqual';
import toPairs from 'lodash/toPairs';
import Constants from '@components/tools/Constants';

const defaultColDef = {
  editable: false,
  sortable: true,
  resizable: true,
  filter: true,
  flex: 1,
  minWidth: 100,
};

class GenGridx extends Component {
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
          this.gridApi.setGridOption('rowData', gridData);
          if (selected) {
            this.gridApi.forEachNode((node) => {
              node.setSelected(node.data.id === selected.id);
            });
          }
        }
      }
    }
  }

  onGridReady = (params) => {
    const { gridData } = this.props;
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.setGridOption('rowData', gridData);
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
            rowSelection={{
              mode: 'singleRow',
              checkboxes: false,
              enableClickSelection: true,
            }}
            suppressCellFocus // https://www.ag-grid.com/react-data-grid/grid-options/#reference-selection
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

GenGridx.propTypes = {
  columnDefs: PropTypes.array.isRequired,
  gridData: PropTypes.array.isRequired,
  pageSize: PropTypes.number,
  theme: PropTypes.string,
};

GenGridx.defaultProps = {
  pageSize: Constants.GRID_THEME.BALHAM.PAGE_SIZE,
  theme: Constants.GRID_THEME.BALHAM.VALUE,
};

export default GenGridx;
