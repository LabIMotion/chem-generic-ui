import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import LTooltip from '../../shared/LTooltip';
import VocabManager from '../../../utils/vocMgr';
import ButtonConfirm from '../../fields/ButtonConfirm';

const editableSource = ['Element', 'Segment', 'Dataset'];

const VocabGrid = ({ onVocSelect, onVocDelete }) => {
  const [rowData, setRowData] = useState([]);
  const gridRef = useRef(null); // Add a reference to the grid

  useEffect(() => {
    const fetchVocabularies = async () => {
      const res = await VocabManager.getAllVocabularies();
      if (res.notify.isSuccess) {
        setRowData(res.element.data || []);
      }
    };
    fetchVocabularies();
  }, []);

  const columnDefs = [
    {
      headerName: 'Action',
      cellRenderer: (params) => (
        <>
          <LTooltip idf="voc_add2tpl">
            <Button className="btn-gxs" onClick={() => onVocSelect(params)}>
              Add
            </Button>
          </LTooltip>
          <ButtonConfirm
            cls="btn-gxs gu-ml-1"
            msg="Delete this Lab-Vocab permanently?"
            fnClick={onVocDelete}
            fnParams={params}
            disabled={!editableSource.includes(params.data.source)}
          />
        </>
      ),
      sortable: false,
      filter: false,
      width: 120,
    },
    {
      field: 'id',
      headerName: 'ID',
      sortable: false,
      filter: false,
      width: 70,
    },
    {
      field: 'name', // it is from field: 'field',
      headerName: 'Field Name',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: 'label',
      headerName: 'Display Name',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: 'field_type', // it is from field: 'type',
      headerName: 'Type',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: 'source', // it is from field: 'voc.source',
      headerName: 'Ref. Source',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: 'layer_id', // it is from field: 'voc.layer_id',
      headerName: 'Ref. Source Layer',
      sortable: true,
      filter: true,
      flex: 1,
    },
    {
      field: 'ontology.short_form',
      headerName: 'Ref. Terminology',
      sortable: true,
      filter: true,
      flex: 1,
    },
  ];

  return (
    <div
      className="ag-theme-alpine"
      style={{ height: '600px', width: '100%', overflow: 'auto' }}
    >
      <AgGridReact
        ref={gridRef}
        columnDefs={columnDefs}
        rowData={rowData}
        domLayout="normal"
        suppressAutoSize
      />
    </div>
  );
};

export default VocabGrid;
