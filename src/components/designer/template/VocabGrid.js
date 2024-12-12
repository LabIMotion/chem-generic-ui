import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import { AgGridReact } from 'ag-grid-react';
import LTooltip from '../../shared/LTooltip';
import VocabManager from '../../../utils/vocMgr';
import ButtonConfirm from '../../fields/ButtonConfirm';
import Constants from '../../tools/Constants';

const editableSource = [
  Constants.GENERIC_TYPES.ELEMENT,
  Constants.GENERIC_TYPES.SEGMENT,
  Constants.GENERIC_TYPES.DATASET,
];

const VocabGrid = ({ onVocSelect, onVocDelete }) => {
  const gridRef = useRef();
  const qfRef = useRef();
  const gridStyle = useMemo(() => ({ height: '600px', width: '100%' }), []);
  const [rowData, setRowData] = useState([]);
  const [columnDefs] = useState([
    {
      headerName: 'Action',
      cellRenderer: (params) => (
        <>
          <LTooltip idf="voc_add2tpl">
            <Button className="btn-gxs" onClick={() => onVocSelect(params)}>
              Add
            </Button>
          </LTooltip>
          {editableSource.includes(params.data.source) && (
            <ButtonConfirm
              cls="btn-gxs gu-ml-1"
              msg="Delete this Lab-Vocab permanently?"
              fnClick={onVocDelete}
              fnParams={params}
              disabled={false}
            />
          )}
        </>
      ),
      sortable: false,
      width: 100,
    },
    {
      field: 'id',
      headerName: 'ID',
      sortable: false,
      width: 70,
    },
    {
      field: 'name',
      headerName: 'Field Name',
      width: 200,
    },
    {
      field: 'label',
      headerName: 'Display Name',
      width: 200,
    },
    {
      field: 'field_type',
      headerName: 'Type',
      width: 120,
    },
    {
      field: 'source',
      headerName: 'Ref. Source',
      width: 120,
    },
    {
      field: 'voc.source_name',
      headerName: 'Ref. Source Name',
      width: 200,
    },
    {
      field: 'layer_id',
      headerName: 'Ref. Source Layer',
      width: 200,
    },
    {
      field: 'ontology.short_form',
      headerName: 'Ref. Terminology',
      width: 120,
    },
  ]);
  const defaultColDef = useMemo(() => {
    return {
      minWidth: 70,
      filter: false,
      sortable: true,
    };
  }, []);

  useEffect(() => {
    const fetchVocabularies = async () => {
      const res = await VocabManager.getAllVocabularies();
      if (res.notify.isSuccess) {
        setRowData(res.element.data || []);
      }
    };
    fetchVocabularies();
  }, []);

  const onFilterTextBoxChanged = useCallback(() => {
    gridRef.current.api.setGridOption('quickFilterText', qfRef.current.value);
  }, []);

  return (
    <div>
      <div className="mb-2">
        <Form>
          <Form.Control
            ref={qfRef}
            placeholder="Enter text to filter..."
            onChange={onFilterTextBoxChanged}
          />
        </Form>
      </div>
      <div className={Constants.GRID_THEME.ALPINE.VALUE} style={gridStyle}>
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          rowData={rowData}
        />
      </div>
    </div>
  );
};

VocabGrid.propTypes = {
  onVocSelect: PropTypes.func.isRequired,
  onVocDelete: PropTypes.func.isRequired,
};

export default VocabGrid;
