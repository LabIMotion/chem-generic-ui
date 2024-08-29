import React, { useState } from 'react';
import {
  Button,
  ButtonToolbar,
  Tooltip,
  OverlayTrigger,
} from 'react-bootstrap';
import { cloneDeep } from 'lodash';
import AttrNewBtn from './AttrNewBtn';
import GridToolbar from './GridToolbar';
import Constants from '../tools/Constants';
import GenGridEl from '../details/GenGridEl';
import GenGridSg from '../details/GenGridSg';
import GenGridDs from '../details/GenGridDs';
import getPageSizeForTheme from '../../utils/grid';
import Template from './template/Template';
import AttrUploadBtn from './AttrUploadBtn';
import DocuConst from '../tools/DocuConst';
import FIcons from '../icons/FIcons';

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
    genericType,
    gridData,
    klasses,
    preview,
  } = _props;
  const [theme, setTheme] = useState(Constants.GRID_THEME.BALHAM.VALUE);
  const [data, setData] = useState(null);

  const onDataSelected = (_data) => {
    if (_data) {
      const updatedData = cloneDeep(_data);
      setData(updatedData);
    }
  };

  // const innerAction = _result => {
  //   // createLayer
  //   const { element: newElement, notify } = _result;
  //   if (notify.isSuccess) {
  //     const locatedIndex = gridData.findIndex(e => e.uuid === newElement.uuid);
  //     if (locatedIndex > -1) {
  //       const updatedData = { ...data, ...newElement }; // State Mutation
  //       setData(updatedData);
  //     }
  //   }
  //   fnDerive(_result);
  // };

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
            genericType={genericType}
            fnShowProp={onDataSelected}
            // fnShowPropJson={() => {}}
            gridData={gridData}
            pageSize={getPageSizeForTheme(theme)}
            theme={theme}
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
            genericType={genericType}
            fnShowProp={onDataSelected}
            // fnShowPropJson={() => {}}
            gridData={gridData}
            klasses={klasses}
            pageSize={getPageSizeForTheme(theme)}
            theme={theme}
          />
        );
      case Constants.GENERIC_TYPES.DATASET:
        return (
          <GenGridDs
            fnCopyKlass={fnCopy}
            fnDeActivateKlass={fnActive}
            fnDownloadKlass={fnDownload}
            fnEditKlass={fnUpdate}
            genericType={genericType}
            fnShowProp={onDataSelected}
            // fnShowPropJson={() => {}}
            gridData={gridData}
            pageSize={getPageSizeForTheme(theme)}
            theme={theme}
          />
        );
      default:
        return <>Undefined Data.</>;
    }
  };

  return (
    <>
      <ButtonToolbar style={{ display: 'inline-block' }}>
        <GridToolbar
          btnNew={
            <AttrNewBtn
              fnCreate={fnCreate}
              genericType={genericType}
              klasses={klasses || []}
            />
          }
          btnUpload={
            <AttrUploadBtn
              data={klasses}
              fnUpload={fnUpload}
              genericType={genericType}
            />
          }
          fnClickLarge={() => setTheme(Constants.GRID_THEME.ALPINE.VALUE)}
          fnClickSmall={() => setTheme(Constants.GRID_THEME.BALHAM.VALUE)}
        />
        <OverlayTrigger
          delayShow={1000}
          placement="top"
          overlay={<Tooltip id="_field_docsite_tooltip">Learn more</Tooltip>}
        >
          <Button
            bsStyle="link"
            href={[DocuConst.DOC_SITE, 'guides', 'designer'].join('/')}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
          >
            {FIcons.faCircleQuestion}
          </Button>
        </OverlayTrigger>
      </ButtonToolbar>
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
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default Designer;
