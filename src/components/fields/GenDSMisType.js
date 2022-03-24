import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const GenDSMisType = (props) => {
  const { uiCtrl } = props;
  if (uiCtrl) {
    return (
      <OverlayTrigger
        placement="top"
        delay={300}
        overlay={(
          <Tooltip id="tooltip">
            Type (Chemical Methods Ontology) has been changed.
            <br />
            Please review this Dataset content.
          </Tooltip>
)}
      >
        <span style={{ color: 'red' }}>
          <FontAwesomeIcon icon="fas fa-exclamation-circle" />
&nbsp;
        </span>
      </OverlayTrigger>
    );
  }
  return null;
};

GenDSMisType.propTypes = { uiCtrl: PropTypes.bool.isRequired };

export default GenDSMisType;
