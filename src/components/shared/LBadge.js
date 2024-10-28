import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';

const LBadge = (props) => {
  const { as, cls, text } = props;
  if (as === 'badge')
    return (
      <Badge pill className="ms-1" bg="dark">
        {text}
      </Badge>
    );

  return (
    <Badge pill className={`ms-1 lbg-outline-${cls}`}>
      {text}
    </Badge>
  );
};

LBadge.propTypes = {
  as: PropTypes.string,
  cls: PropTypes.string,
  text: PropTypes.string.isRequired,
};
LBadge.defaultProps = { as: 'badge', cls: 'default' };

export default LBadge;
