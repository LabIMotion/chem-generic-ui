/* eslint-disable react/require-default-props */
/* eslint-disable react/forbid-prop-types */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import TemplateBar from './TemplateBar';
import TemplateProps from './TemplateProps';
import Constants from '../../tools/Constants';
import Preview from '../preview/Preview';
import { handleSaveSorting } from '../../../utils/template/sorting-handler';

const Template = (props) => {
  const {
    data: inputData,
    vocabularies,
    fnUpdate,
    fnSubmit,
    genericType,
    preview,
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
    if (_page === 'p') {
      preview.fnRevisions(opData.data);
    }
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
      {opData.active === 'w' ? (
        <TemplateProps
          data={opData.data}
          vocabularies={vocabularies}
          // fnUpdate={fnUpdate}
          genericType={genericType}
          innerAction={innerAction}
          fnSubmit={handleSubmit}
        />
      ) : (
        <Preview
          revisions={preview.revisions}
          data={opData.data}
          fnRetrieve={innerAction}
          fnDelete={preview.fnDelRevisions}
          canDL
        />
      )}
    </div>
  );
};

Template.propTypes = {
  data: PropTypes.object,
  fnSubmit: PropTypes.func.isRequired,
  fnUpdate: PropTypes.func.isRequired, // update element with new element
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  preview: PropTypes.shape({
    fnDelRevisions: PropTypes.func,
    fnRetrieve: PropTypes.func,
    fnRevisions: PropTypes.func,
    revisions: PropTypes.array,
  }),
  vocabularies: PropTypes.array,
};

Template.defaultProps = {
  vocabularies: [],
  preview: {
    fnDelRevisions: () => {},
    fnRetrieve: () => {},
    fnRevisions: () => {},
    revisions: [],
  },
};

export default Template;
