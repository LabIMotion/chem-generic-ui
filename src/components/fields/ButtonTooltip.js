import React from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { v4 as uuid } from 'uuid';

const ButtonTooltip = (props) => {
  const { tip } = props;
  const tooltip = <Tooltip id={uuid()}>{tip}</Tooltip>;
  const {
    size, bs, fnClick, element, place, fa, disabled, txt
  } = props;
  const content = txt ? (
    <span>
      {txt}
      {' '}
    </span>
  ) : '';
  if (bs === '') {
    return (
      <OverlayTrigger delayShow={1000} placement={place} overlay={tooltip}>
        <Button bsSize={size} onClick={() => fnClick(element)} disabled={disabled}>
          {content}
          <i className={`fa ${fa}`} aria-hidden="true" />
        </Button>
      </OverlayTrigger>
    );
  }
  return (
    <OverlayTrigger delayShow={1000} placement={place} overlay={tooltip}>
      <Button bsSize={size} bsStyle={bs} onClick={() => fnClick(element)} disabled={disabled}>
        {content}
        <i className={`fa ${fa}`} aria-hidden="true" />
      </Button>
    </OverlayTrigger>
  );
};

ButtonTooltip.propTypes = {
  tip: PropTypes.string.isRequired,
  element: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  fnClick: PropTypes.func.isRequired,
  bs: PropTypes.string,
  size: PropTypes.string,
  place: PropTypes.string,
  fa: PropTypes.string,
  disabled: PropTypes.bool,
  txt: PropTypes.string,
};

ButtonTooltip.defaultProps = {
  bs: '',
  size: 'xs',
  place: 'top',
  fa: 'fa-pencil-square-o',
  disabled: false,
  txt: null,
  element: {}
};

export default ButtonTooltip;
