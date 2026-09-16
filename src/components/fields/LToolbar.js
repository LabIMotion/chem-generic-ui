/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Constants from '@components/tools/Constants';
import ButtonArrange from '@components/actions/ButtonArrange';
import ButtonDraw from '@components/actions/ButtonDraw';
import FlowViewerBtn from '@components/flow/FlowViewerBtn';
import FileExportButton from '@ui/common/FileExportButton';
import VersionListBtn from '@components/designer/preview/VersionListBtn';
// import SourceBtn from '@components/fields/SourceBtn';
import ButtonReload from '@components/fields/ButtonReload';
import VersionInfoLabel from '@components/fields/VersionInfoLabel';
import FIcons from '@components/icons/FIcons';
import { editable } from '@utils/pureUtils';
import { useGenUIContext } from '@components/details/GenUIContext';

function LToolbar({
  generic,
  genericType,
  klass,
  fnReload,
  fnRetrieve,
  onExpandAll,
  editMode,
}) {
  const {
    showOverview,
    toggleOverview,
    showConsumer,
    toggleConsumer,
    isProviderPresent,
  } = useGenUIContext();
  const hasRegKey = !!generic?.metadata?.registries?.[0];
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

  const canEdit = editable(editMode, true);

  if (genericType === Constants.GENERIC_TYPES.DATASET) {
    return (
      <ButtonToolbar className="p-1 gap-1">
        <VersionInfoLabel
          className="ms-auto"
          version={generic?.properties?.version}
          identifier={generic?.properties?.identifier}
        />
        {canEdit && (
          <ButtonReload klass={klass} generic={generic} fnReload={fnReload} />
        )}
      </ButtonToolbar>
    );
  }

  return (
    <ButtonToolbar className="p-1 gap-1 d-flex">
      {isProviderPresent && (
        <Button
          variant="primary"
          size="sm"
          onClick={toggleOverview}
          title={showOverview ? 'Hide Overview Map' : 'Show Overview Map'}
        >
          {FIcons.faChartBar} {showOverview ? 'Hide Overview' : 'Show Overview'}
        </Button>
      )}
      {isProviderPresent && hasRegKey && (
        <Button
          variant="primary"
          size="sm"
          onClick={toggleConsumer}
          title={showConsumer ? 'Hide Layer Stack' : 'Show Layer Stack'}
        >
          {FIcons.faCubesStacked}{' '}
          {showConsumer ? 'Hide Layer Stack' : 'Show Layer Stack'}
        </Button>
      )}
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
      {canEdit && (
        <ButtonArrange
          generic={generic}
          genericType={genericType}
          fnSave={fnReload}
        />
      )}
      {genericType === Constants.GENERIC_TYPES.ELEMENT && canEdit && (
        <ButtonDraw
          generic={generic}
          genericType={genericType}
          fnSave={fnReload}
        />
      )}
      {canEdit && <FlowViewerBtn generic={generic} />}
      <FileExportButton generic={generic} />
      <VersionListBtn
        generic={generic}
        fnRetrieve={fnRetrieve}
        genericType={genericType}
      />
      <VersionInfoLabel
        className="ms-auto"
        version={generic?.properties?.version}
        identifier={generic?.properties?.identifier}
      />
      {canEdit && (
        <ButtonReload klass={klass} generic={generic} fnReload={fnReload} />
      )}
      {/* <SourceBtn generic={generic} fnRetrieve={fnRetrieve} /> */}
    </ButtonToolbar>
  );
}

LToolbar.propTypes = {
  generic: PropTypes.object.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  klass: PropTypes.object.isRequired,
  fnReload: PropTypes.func,
  fnRetrieve: PropTypes.func,
  onExpandAll: PropTypes.func,
  editMode: PropTypes.bool,
};

LToolbar.defaultProps = {
  fnReload: () => {},
  fnRetrieve: () => {},
  onExpandAll: () => {},
  editMode: true,
};

export default LToolbar;
