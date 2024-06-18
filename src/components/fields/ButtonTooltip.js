import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';
import FIcons from '../icons/FIcons';

const ButtonTooltip = props => {
  const { tip } = props;
  const tt = typeof tip === 'string' ? [tip] : tip;
  const tooltip = (
    <Tooltip id={uuid()} className="pre_line_tooltip">
      {tt.join('\r\n')}
    </Tooltip>
  );
  const { size, bs, fnClick, element, place, fa, disabled, txt, btnCls } =
    props;
  const content = txt ? <span>{txt} </span> : '';
  if (bs === '') {
    return (
      <OverlayTrigger delayShow={1000} placement={place} overlay={tooltip}>
        <Button
          className={btnCls}
          bsSize={size}
          onClick={() => fnClick(element)}
          disabled={disabled}
        >
          {FIcons[fa]}&nbsp;{content}
        </Button>
      </OverlayTrigger>
    );
  }
  return (
    <OverlayTrigger delayShow={1000} placement={place} overlay={tooltip}>
      <Button
        className={btnCls}
        bsSize={size}
        bsStyle={bs}
        onClick={() => fnClick(element)}
        disabled={disabled}
      >
        {FIcons[fa]}&nbsp;{content}
      </Button>
    </OverlayTrigger>
  );
};

ButtonTooltip.propTypes = {
  tip: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
  element: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  fnClick: PropTypes.func.isRequired,
  bs: PropTypes.string,
  size: PropTypes.string,
  place: PropTypes.string,
  fa: PropTypes.string,
  disabled: PropTypes.bool,
  txt: PropTypes.string,
  btnCls: PropTypes.string,
};

ButtonTooltip.defaultProps = {
  bs: '',
  size: 'sm',
  place: 'top',
  fa: 'faPencil',
  disabled: false,
  txt: null,
  element: {},
  btnCls: '',
};

export default ButtonTooltip;
