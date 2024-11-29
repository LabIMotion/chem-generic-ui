import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown } from 'react-bootstrap';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';
import TAs from '../tools/TAs';

const ButtonTooltip = (props) => {
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
  if (bs === '') {
    return (
      <LTooltip idf={idf} placement={place}>
        <Button
          className={btnCls}
          size={size || undefined}
          onClick={(e) => {
            e.stopPropagation();
            fnClick(element);
          }}
          disabled={disabled}
        >
          {content === '' && FIcons[fa]}
          {content !== '' && (
            <>
              {FIcons[fa]}&nbsp;
              {content}
            </>
          )}
        </Button>
      </LTooltip>
    );
  }
  return (
    <LTooltip idf={idf} placement={place}>
      <Button
        className={btnCls}
        size={size || undefined}
        variant={bs}
        onClick={(e) => {
          e.stopPropagation();
          fnClick(element);
        }}
        disabled={disabled}
      >
        {content === '' && FIcons[fa]}
        {content !== '' && (
          <>
            {FIcons[fa]}&nbsp;
            {content}
          </>
        )}
      </Button>
    </LTooltip>
  );
};

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
