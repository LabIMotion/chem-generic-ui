/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Constants from '../tools/Constants';
import ButtonArrange from '../actions/ButtonArrange';
import ButtonDraw from '../actions/ButtonDraw';
import FlowViewerBtn from '../flow/FlowViewerBtn';
import ButtonExport from '../actions/ButtonExport';
import VersionListBtn from '../designer/preview/VersionListBtn';
import ButtonReload from './ButtonReload';
import FIcons from '../icons/FIcons';

const LToolbar = ({
  generic,
  genericType,
  klass,
  fnExport,
  fnReload,
  fnRetrieve,
  onExpandAll,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpandToggle = () => {
    const newExpandState = !isExpanded;
    setIsExpanded(newExpandState);
    onExpandAll(newExpandState);
  };

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
    <ButtonToolbar className="p-1 gap-1 d-flex">
      <Button
        variant="primary"
        size="sm"
        onClick={handleExpandToggle}
        title={isExpanded ? 'Collapse all Layers' : 'Expand all Layers'}
        style={{ minWidth: '80px' }}
      >
        {isExpanded ? FIcons.faAnglesUp : FIcons.faAnglesDown}{' '}
        {isExpanded ? 'Collapse' : 'Expand'}
      </Button>
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
  onExpandAll: PropTypes.func,
};

LToolbar.defaultProps = {
  fnExport: () => {},
  fnReload: () => {},
  fnRetrieve: () => {},
  onExpandAll: () => {},
};

export default LToolbar;
