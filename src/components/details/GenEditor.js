/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import LToolbar from '@components/fields/LToolbar';
import GenInterface from '@components/details/GenInterface';
import Constants from '@components/tools/Constants';

/**
 * GenEditor is a combined component that includes both the LToolbar and GenInterface
 * This allows consuming applications to use a single component instead of both separately
 */
const GenEditor = ({
  generic,
  genericType,
  klass,
  fnChange,
  fnReload,
  fnRetrieve,
  fnNavi,
  extLayers,
  genId,
  isPreview,
  isActiveWF,
  isSearch,
  isSpCall,
  aiComp,
}) => {
  const [expandAll, setExpandAll] = useState(false);

  // If generic object is empty, don't render anything
  if (Object.keys(generic || {}).length === 0) return null;

  const handleExpandAll = (isExpanded) => {
    setExpandAll(isExpanded);
  };

  return (
    <div className="gen-editor">
      <LToolbar
        generic={generic}
        genericType={genericType}
        klass={klass}
        fnReload={fnReload}
        fnRetrieve={fnRetrieve}
        onExpandAll={handleExpandAll}
      />
      <GenInterface
        generic={generic}
        fnChange={fnChange}
        extLayers={extLayers}
        genId={genId}
        isPreview={isPreview}
        isActiveWF={isActiveWF}
        isSearch={isSearch}
        fnNavi={fnNavi}
        isSpCall={isSpCall}
        aiComp={aiComp}
        expandAll={expandAll}
      />
    </div>
  );
};

GenEditor.propTypes = {
  // Props for both components
  generic: PropTypes.object.isRequired,

  // LToolbar props
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  klass: PropTypes.object.isRequired,
  fnReload: PropTypes.func,
  fnRetrieve: PropTypes.func,

  // GenInterface props
  fnChange: PropTypes.func.isRequired,
  extLayers: PropTypes.array,
  genId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isPreview: PropTypes.bool,
  isActiveWF: PropTypes.bool,
  isSearch: PropTypes.bool,
  fnNavi: PropTypes.func,
  isSpCall: PropTypes.bool,
  aiComp: PropTypes.any,
};

GenEditor.defaultProps = {
  // LToolbar default props
  fnReload: () => {},
  fnRetrieve: () => {},

  // GenInterface default props
  extLayers: [],
  genId: 0,
  isPreview: false,
  isActiveWF: false,
  isSearch: false,
  fnNavi: () => {},
  isSpCall: false,
  aiComp: null,
};

export default GenEditor;