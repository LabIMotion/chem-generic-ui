import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';

/**
 * A wrapper component for react-bootstrap Badge with solid and outline variants.
 * Provides consistent styling and spacing for badge elements throughout the application.
 *
 * @component
 * @example
 * // Solid badge
 * <LBadge variant="solid" color="primary" text="Active" />
 *
 * @example
 * // Outline badge with children
 *
 * <LBadge variant="outline" color="warning">
 *   <Icon /> Custom Content
 * </LBadge>
 */
function LBadge({ variant, color, text, children, className }) {
  const content = children || text;

  // Early return for empty content
  if (!content && content !== 0) return null;

  // Build className
  const classes = ['ms-1'];
  if (className) classes.push(className);
  if (variant === 'outline') classes.push(`lbg-outline-${color}`);
  const computedClassName = classes.join(' ');

  // Solid variant uses react-bootstrap's bg prop
  if (variant === 'solid') {
    return (
      <Badge pill className={computedClassName} bg={color}>
        {content}
      </Badge>
    );
  }

  // Outline variant uses custom CSS classes
  return (
    <Badge pill className={computedClassName}>
      {content}
    </Badge>
  );
}

LBadge.propTypes = {
  /** Badge style: 'solid' for filled background, 'outline' for bordered style */
  variant: PropTypes.oneOf(['solid', 'outline']),
  color: PropTypes.string.isRequired,
  /** Text content for the badge (alternative to children) */
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** React children (takes precedence over text prop) */
  children: PropTypes.node,
  /** Additional CSS classes to apply */
  className: PropTypes.string,
};

LBadge.defaultProps = {
  variant: 'solid',
  text: '',
  children: null,
  className: '',
};

export default LBadge;
