import React, { useState } from 'react';
import { ButtonToolbar } from 'react-bootstrap';
import AttrNewBtn from './AttrNewBtn';
import GridToolbar from './GridToolbar';
import Constants from '../tools/Constants';
import GenGridEl from '../details/GenGridEl';
import getPageSizeForTheme from '../../utils/grid';
import GenTemplate from './template/GenTemplate';

const Designer = _props => {
  const {
    fnCopy,
    fnCreate,
    fnDeActivateKlass,
    fnDelete,
    fnDerive, // return the new generic object
    // fnSaveFlow, // should be combined to fnSubmit
    // fnSubmit, // can be save or release
    fnUpdate,
    fnUpload,
    genericType,
    gridData,
    klasses,
  } = _props;
  const [theme, setTheme] = useState(Constants.GRID_THEME.BALHAM.VALUE);
  const [data, setData] = useState(null);

  const onDataSelected = _data => {
    if (_data) {
      console.log('onDataSelected', _data);
      setData(_data);
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
          fnClickLarge={() => setTheme(Constants.GRID_THEME.ALPINE.VALUE)}
          fnClickSmall={() => setTheme(Constants.GRID_THEME.BALHAM.VALUE)}
        />
      </ButtonToolbar>
      <GenGridEl
        fnCopyKlass={fnCopy}
        fnDeActivateKlass={fnDeActivateKlass}
        fnDeleteKlass={fnDelete}
        fnEditKlass={fnUpdate}
        fnShowProp={onDataSelected}
        fnShowPropJson={() => {}}
        gridData={gridData}
        pageSize={getPageSizeForTheme(theme)}
        theme={theme}
      />
      {data ? (
        <GenTemplate
          data={data}
          fnDelete={fnDelete}
          fnDerive={fnDerive}
          // fnSaveFlow={fnSaveFlow}
          // fnSubmit={fnSubmit}
          fnUpdate={fnUpdate}
          fnUpload={fnUpload}
          genericType={genericType}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default Designer;
