import React from 'react';
import PropTypes from 'prop-types';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

const GenDSMisType = (props) => {
  const { uiCtrl } = props;
  if (uiCtrl) {
    return (
      <LTooltip idf="chmo_changed">
        <span className="text-danger">
          {FIcons.faExclamationCircle}
          &nbsp;
        </span>
      </LTooltip>
    );
  }
  return null;
};

GenDSMisType.propTypes = { uiCtrl: PropTypes.bool.isRequired };

export default GenDSMisType;
