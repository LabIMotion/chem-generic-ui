/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Constants from '../tools/Constants';
import ButtonArrange from '../actions/ButtonArrange';
import ButtonDraw from '../actions/ButtonDraw';
import FlowViewerBtn from '../flow/FlowViewerBtn';
import ButtonExport from '../actions/ButtonExport';
import VersionListBtn from '../designer/preview/VersionListBtn';
import ButtonReload from './ButtonReload';

const LToolbar = ({
  generic,
  genericType,
  klass,
  fnExport,
  fnReload,
  fnRetrieve,
}) => {
  if (
    ![
      Constants.GENERIC_TYPES.ELEMENT,
      Constants.GENERIC_TYPES.SEGMENT,
      Constants.GENERIC_TYPES.DATASET,
    ].includes(genericType)
  )
    return null;

  if (genericType === Constants.GENERIC_TYPES.DATASET) {
    return (
      <ButtonToolbar className="p-1 gap-1">
        <ButtonReload klass={klass} generic={generic} fnReload={fnReload} />
      </ButtonToolbar>
    );
  }

  return (
    <ButtonToolbar className="p-1 gap-1">
      <ButtonArrange
        generic={generic}
        genericType={genericType}
        fnSave={fnReload}
      />
      {Constants.GENERIC_TYPES.ELEMENT && (
        <ButtonDraw
          generic={generic}
          genericType={genericType}
          fnSave={fnReload}
        />
      )}
      <FlowViewerBtn generic={generic} />
      <ButtonExport generic={generic} fnExport={fnExport} />
      <VersionListBtn generic={generic} fnRetrieve={fnRetrieve} />
      <ButtonReload klass={klass} generic={generic} fnReload={fnReload} />
    </ButtonToolbar>
  );
};

LToolbar.propTypes = {
  generic: PropTypes.object.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  klass: PropTypes.object.isRequired,
  fnExport: PropTypes.func,
  fnReload: PropTypes.func,
  fnRetrieve: PropTypes.func,
};

LToolbar.defaultProps = {
  fnExport: () => {},
  fnReload: () => {},
  fnRetrieve: () => {},
};

export default LToolbar;
