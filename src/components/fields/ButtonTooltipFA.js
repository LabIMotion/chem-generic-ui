import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import FIcons from '../icons/FIcons';

const ButtonTooltipFA = (props) => {
  const { tip } = props;
  const tt = typeof tip === 'string' ? [tip] : tip;
  const tooltip = (
    <Tooltip id={uuid()} className="pre_line_tooltip">
      {tt.join('\r\n')}
    </Tooltip>
  );
  const { bs, fnClick, element, place, icon, disabled, txt } = props;
  const content = txt ? <span>{txt} </span> : '';
  if (bs === '') {
    return (
      <OverlayTrigger delayShow={1000} placement={place} overlay={tooltip}>
        <Button
          className="btn-sm"
          onClick={() => fnClick(element)}
          disabled={disabled}
        >
          {icon}
          {content}
        </Button>
      </OverlayTrigger>
    );
  }
  return (
    <OverlayTrigger delayShow={1000} placement={place} overlay={tooltip}>
      <Button
        className="btn-sm"
        variant={bs}
        onClick={() => fnClick(element)}
        disabled={disabled}
      >
        {icon}
        {content}
      </Button>
    </OverlayTrigger>
  );
};

ButtonTooltipFA.propTypes = {
  tip: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
  element: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  fnClick: PropTypes.func.isRequired,
  bs: PropTypes.string,
  place: PropTypes.string,
  icon: PropTypes.element,
  disabled: PropTypes.bool,
  txt: PropTypes.string,
};

ButtonTooltipFA.defaultProps = {
  bs: 'light',
  place: 'top',
  icon: FIcons.faFileExport,
  disabled: false,
  txt: null,
  element: {},
};

export default ButtonTooltipFA;
