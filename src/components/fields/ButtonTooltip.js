import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';
import TooltipButton from '@ui/common/TooltipButton';
import TAs from '@components/tools/TAs';

const ButtonTooltip = memo((props) => {
  const {
    idf,
    bs,
    size,
    fnClick,
    element,
    place,
    fa,
    disabled,
    txt,
    btnCls,
    as,
  } = props;
  const content = txt ? <span>{txt} </span> : '';
  const conditionMenu = (
    <Dropdown.Item
      eventKey={`${idf}_menu_item`}
      onClick={() => fnClick(element)}
    >
      {FIcons[fa]}&nbsp;&nbsp;{TAs[idf]}
    </Dropdown.Item>
  );
  if (as === 'menu') {
    return conditionMenu;
  }
  return (
    <TooltipButton
      tooltipId={idf}
      placement={place}
      variant={bs || undefined}
      size={size || undefined}
      className={btnCls}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        fnClick(element);
      }}
    >
      {content === '' && FIcons[fa]}
      {content !== '' && (
        <>
          {FIcons[fa]}&nbsp;
          {content}
        </>
      )}
    </TooltipButton>
  );
});

ButtonTooltip.propTypes = {
  idf: PropTypes.string,
  element: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  fnClick: PropTypes.func.isRequired,
  bs: PropTypes.string,
  size: PropTypes.string,
  place: PropTypes.string,
  fa: PropTypes.string,
  disabled: PropTypes.bool,
  txt: PropTypes.string,
  btnCls: PropTypes.string,
  as: PropTypes.string,
};

ButtonTooltip.defaultProps = {
  idf: 'ltt',
  bs: 'light',
  size: undefined,
  place: 'top',
  fa: 'faPencil',
  disabled: false,
  txt: null,
  element: {},
  btnCls: '',
  as: 'button',
};

export default ButtonTooltip;
