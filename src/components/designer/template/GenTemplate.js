/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Constants from '../../tools/Constants';
import TemplateToolbar from '../TemplateToolbar';
import TemplateProps from './TemplateProps';

const GenTemplate = props => {
  const { data, fnDelete, fnDerive, fnUpdate, fnUpload, genericType } = props;

  return (
    <>
      <TemplateToolbar />
      <TemplateProps
        data={data}
        fnDelete={fnDelete}
        fnDerive={fnDerive}
        fnUpdate={fnUpdate}
        fnUpload={fnUpload}
        genericType={genericType}
      />
    </>
  );
};

GenTemplate.propTypes = {
  data: PropTypes.object,
  fnDelete: PropTypes.func.isRequired,
  fnDerive: PropTypes.func.isRequired,
  fnUpdate: PropTypes.func.isRequired,
  fnUpload: PropTypes.func.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
  ]).isRequired,
};

export default GenTemplate;
