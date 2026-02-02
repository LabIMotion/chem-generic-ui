import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  Button,
  ButtonToolbar,
  Tooltip,
  OverlayTrigger,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import cloneDeep from 'lodash/cloneDeep';
import sortBy from 'lodash/sortBy';
import AttrNewBtn from '@components/designer/AttrNewBtn';
import GridToolbar from '@components/designer/GridToolbar';
import Constants from '@components/tools/Constants';
import GenGridEl from '@components/details/GenGridEl';
import GenGridSg from '@components/details/GenGridSg';
import GenGridDs from '@components/details/GenGridDs';
import getPageSizeForTheme from '@utils/grid';
import Template from '@components/designer/template/Template';
import AttrUploadBtn from '@components/designer/AttrUploadBtn';
import DocuConst from '@components/tools/DocuConst';
import FIcons from '@components/icons/FIcons';
import DesignerContext, { DesignerProvider } from '@components/designer/DesignerContext';
import SyncBtn from '@components/repo/SyncButton';

const ContentComponents = {
  [Constants.GENERIC_TYPES.ELEMENT]: 'Generic Elements Designer',
  [Constants.GENERIC_TYPES.SEGMENT]: 'Generic Segments Designer',
  [Constants.GENERIC_TYPES.DATASET]: 'Generic Datasets Designer',
};

const FNLocation = (type) => {
  const text = ContentComponents[type];
  return (
    <div className="col-auto">
      <span>You&apos;re in the </span>
      <span className="fw-bold">{text}</span>
    </div>
  );
};

const Designer = (_props) => {
  const {
    fnCopy,
    fnCreate,
    fnUpload,
    fnDelete,
    fnSubmit,
    fnActive,
    fnDownload,
    fnUpdate,
    fnRefresh,
    genericType,
    gridData = [],
    klasses,
    preview,
    refSource = { currentUser: {} },
  } = _props;
  const [theme, setTheme] = useState(Constants.GRID_THEME.QUARTZ.VALUE);
  const [data, setData] = useState(null);
  const [filterText, setFilterText] = useState('');
  const qfRef = useRef();
  const setAutoHeightRef = useRef();
  const clearSelectionRef = useRef();

  const sortedKlasses = useMemo(
    () => sortBy(klasses || [], ['label']),
    [klasses]
  );

  useEffect(() => {
    if (gridData.length > 0 && data) {
      const updatedData = gridData.find((e) => e.id === data.id);
      if (
        updatedData &&
        updatedData.properties_template?.uuid !== data.properties_release?.uuid
      ) {
        setData(cloneDeep(updatedData));
      }
    }
  }, [gridData]);

  const onDataSelected = (_data) => {
    if (_data) {
      const updatedData = cloneDeep(_data);
      setData(updatedData);
    }
  };

  const onFilterTextBoxChanged = useCallback(() => {
    setFilterText(qfRef.current.value);
  }, []);

  const onSetAutoHeight = useCallback((setAutoHeightFn) => {
    setAutoHeightRef.current = setAutoHeightFn;
  }, []);

  const onClearSelection = useCallback((clearSelectionFn) => {
    clearSelectionRef.current = clearSelectionFn;
  }, []);

  const handleFullListClick = useCallback(() => {
    // Reset data to initial state (this will clear the grid selection)
    setData(null);
    // Clear filter text
    setFilterText('');
    // Clear the filter input field
    if (qfRef.current) {
      qfRef.current.value = '';
    }
    // Clear grid selection
    if (clearSelectionRef.current) {
      clearSelectionRef.current();
    }
    // Set grid height to full (80vh)
    if (setAutoHeightRef.current) {
      setAutoHeightRef.current();
    }
  }, []);

  const genGrid = () => {
    switch (genericType) {
      case Constants.GENERIC_TYPES.ELEMENT:
        return (
          <GenGridEl
            fnCopyKlass={fnCopy}
            fnDeActivateKlass={fnActive}
            fnDownloadKlass={fnDownload}
            fnDeleteKlass={fnDelete}
            fnEditKlass={fnUpdate}
            fnShowProp={onDataSelected}
            // fnShowPropJson={() => {}}
            gridData={gridData}
            pageSize={getPageSizeForTheme(theme)}
            theme={theme}
            rowSelected={data !== null}
            filterText={filterText}
            onSetAutoHeight={onSetAutoHeight}
            onClearSelection={onClearSelection}
          />
        );
      case Constants.GENERIC_TYPES.SEGMENT:
        return (
          <GenGridSg
            fnCopyKlass={fnCopy}
            fnDeActivateKlass={fnActive}
            fnDownloadKlass={fnDownload}
            fnDeleteKlass={fnDelete}
            fnEditKlass={fnUpdate}
            fnShowProp={onDataSelected}
            // fnShowPropJson={() => {}}
            gridData={gridData}
            pageSize={getPageSizeForTheme(theme)}
            theme={theme}
            rowSelected={data !== null}
            filterText={filterText}
            onSetAutoHeight={onSetAutoHeight}
            onClearSelection={onClearSelection}
          />
        );
      case Constants.GENERIC_TYPES.DATASET:
        return (
          <GenGridDs
            fnCopyKlass={fnCopy}
            fnDeActivateKlass={fnActive}
            fnDownloadKlass={fnDownload}
            fnEditKlass={fnUpdate}
            fnShowProp={onDataSelected}
            // fnShowPropJson={() => {}}
            gridData={gridData}
            pageSize={getPageSizeForTheme(theme)}
            theme={theme}
            rowSelected={data !== null}
            filterText={filterText}
            onSetAutoHeight={onSetAutoHeight}
            onClearSelection={onClearSelection}
          />
        );
      default:
        return <>Undefined Data.</>;
    }
  };

  return (
    <DesignerProvider value={{ klasses: sortedKlasses, genericType }}>
      <Row className="mb-2 align-items-center">
        <Col xs="auto">
          <ButtonToolbar style={{ display: 'inline-block' }}>
            <SyncBtn fnRefresh={fnRefresh} genericType={genericType} />
            <GridToolbar
              btnNew={
                <AttrNewBtn
                  fnCreate={fnCreate}
                  genericType={genericType}
                />
              }
              btnUpload={
                <AttrUploadBtn fnUpload={fnUpload} genericType={genericType} />
              }
              fnClickLarge={() => setTheme(Constants.GRID_THEME.QUARTZ.VALUE)}
              fnClickSmall={() => setTheme(Constants.GRID_THEME.BALHAM.VALUE)}
            >
              <Button
                variant="outline-secondary"
                onClick={handleFullListClick}
                className="gu-btn-outline-secondary"
              >
                Full List
              </Button>
            </GridToolbar>
          </ButtonToolbar>
        </Col>
        <Col>
          <div className="d-flex gap-2">
            <div className="position-relative flex-grow-1">
              <span className="position-absolute top-50 translate-middle-y ms-2 text-muted">
                {FIcons.faMagnifyingGlass}
              </span>
              <Form.Control
                ref={qfRef}
                type="text"
                placeholder="Enter text to filter..."
                style={{ paddingLeft: '2rem' }}
                onChange={onFilterTextBoxChanged}
              />
            </div>
            <OverlayTrigger
              delayShow={1000}
              placement="top"
              overlay={
                <Tooltip id="_field_docsite_tooltip">Learn more</Tooltip>
              }
            >
              <Button
                variant="link"
                href={[DocuConst.DOC_SITE, 'designer'].join('/')}
                target="_blank"
                onClick={(e) => e.stopPropagation()}
              >
                {FIcons.faCircleQuestion}
              </Button>
            </OverlayTrigger>
          </div>
        </Col>
        {FNLocation(genericType)}
      </Row>
      {genGrid()}
      {data ? (
        <Template
          data={data}
          fnSubmit={fnSubmit}
          // fnDelete={fnDelete}
          // fnDerive={innerAction}
          // fnDerive={fnDerive}
          // fnSaveFlow={fnSaveFlow}
          fnUpdate={fnUpdate}
          genericType={genericType}
          preview={preview}
          refSource={refSource}
        />
      ) : (
        <></>
      )}
    </DesignerProvider>
  );
};

export default Designer;
