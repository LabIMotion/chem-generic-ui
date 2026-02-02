/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Constants from '@components/tools/Constants';
import TemplateToolbar from '@components/designer/TemplateToolbar';
import TemplateProps from '@components/designer/template/TemplateProps';

const GenTemplate = props => {
  const { data, fnDelete, fnDerive, fnUpdate, fnUpload, genericType, vocabularies } = props;

  return (
    <>
      <TemplateToolbar />
      <TemplateProps
        data={data}
        vocabularies={vocabularies}
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
  vocabularies: PropTypes.array,
};

GenTemplate.defaultProps = { vocabularies: [] };

export default GenTemplate;
