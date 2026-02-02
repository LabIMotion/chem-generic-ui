/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import TemplateBar from '@components/designer/template/TemplateBar';
import TemplateProps from '@components/designer/template/TemplateProps';
import Constants from '@components/tools/Constants';
import PreviewFunctional from '@components/designer/preview/PreviewFunctional';
import { handleSaveSorting } from '@utils/template/sorting-handler';

const Template = (props) => {
  const {
    data: inputData,
    vocabularies,
    fnSubmit,
    genericType,
    refSource,
  } = props;

  const [opData, setOpData] = useState({
    data: inputData,
    notify: null,
    active: 'w',
  });

  useEffect(() => {
    setOpData((prevOpData) => {
      return {
        ...prevOpData,
        data: inputData,
        notify: null,
        active: 'w',
      };
    });
  }, [inputData]);

  if (!inputData || Object.keys(inputData).length === 0) return null;

  const innerAction = (_result) => {
    const { element: newElement, notify: newNotify, additional } = _result;
    if (newNotify.isSuccess) {
      setOpData((prevState) => {
        return {
          ...prevState,
          data: newElement,
          notify: newNotify,
          active: additional?.active ? additional?.active : prevState.active,
        };
      });
    } else {
      setOpData((prevState) => {
        return {
          ...prevState,
          notify: newNotify,
        };
      });
    }
  };

  const onSwitch = (_page) => {
    setOpData((prevState) => {
      return {
        ...prevState,
        active: _page,
      };
    });
  };

  const handleSubmit = (_e) => {
    const { data, release } = _e;
    const sortedData = handleSaveSorting(data);
    fnSubmit(sortedData, release);
  };

  return (
    <div>
      <TemplateBar
        notify={opData.notify}
        active={opData.active}
        fnSwitch={onSwitch}
      />
      <div
        className="mt-3"
        style={{ overflowY: 'auto', maxHeight: '58vh', height: '58vh' }}
      >
        {opData.active === 'w' && (
          <TemplateProps
            data={opData.data}
            vocabularies={vocabularies}
            genericType={genericType}
            innerAction={innerAction}
            fnSubmit={handleSubmit}
          />
        )}
        {opData.active === 'p' && (
          <PreviewFunctional
            genericType={genericType}
            data={opData.data}
            refSource={refSource}
            fnRetrieve={innerAction}
            canDL
          />
        )}
      </div>
    </div>
  );
};

Template.propTypes = {
  data: PropTypes.object,
  fnSubmit: PropTypes.func.isRequired,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  vocabularies: PropTypes.array,
  refSource: PropTypes.object,
};

Template.defaultProps = {
  vocabularies: [],
  refSource: {},
};

export default Template;
