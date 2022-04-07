/* eslint-disable camelcase */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import GenInterface from './GenInterface';

const GenInterfaceSP = (props) => {
  const { generic, fnChange } = props;
  if (Object.keys(generic).length === 0) return null;
  return (
    <GenInterface
      generic={generic}
      fnChange={fnChange}
      extLayers={[]}
      genId={0}
      isPreview={false}
      isSearch={false}
      isActiveWF={false}
      isSpCall
    />
  );
};

GenInterfaceSP.propTypes = {
  generic: PropTypes.object.isRequired,
  fnChange: PropTypes.func.isRequired,
};

export default GenInterfaceSP;
