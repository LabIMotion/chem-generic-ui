import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';

const LBadge = (props) => {
  const { as, cls, text } = props;
  if (as === 'badge') return <Badge className="gu-ml-2">{text}</Badge>;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <span
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <Badge className={`gu-ml-2 gu-no-pointer lbg-outline-${cls}`}>
        {text}
      </Badge>
    </span>
  );
};

LBadge.propTypes = {
  as: PropTypes.string,
  cls: PropTypes.string,
  text: PropTypes.string.isRequired,
};
LBadge.defaultProps = { as: 'badge', cls: 'default' };

export default LBadge;
