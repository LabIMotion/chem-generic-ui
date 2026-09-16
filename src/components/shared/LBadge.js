import React from 'react';
import PropTypes from 'prop-types';
import { Badge } from 'react-bootstrap';

/**
 * Wrapper for react-bootstrap Badge with solid and outline variants.
 *
 * Supported outline colors: 'default', 'primary', 'warning', 'x'.
 * Solid colors: any valid react-bootstrap bg value ('primary', 'dark', 'warning', etc.).
 *
 * @component
 * @example
 * <LBadge variant="solid" color="primary" text="Active" />
 * <LBadge variant="outline" color="warning">Custom</LBadge>
 * <LBadge variant="solid" color="dark" text="no margin" noMargin />
 */
function LBadge({
  variant = 'solid',
  color,
  text = '',
  children = null,
  className = '',
  noMargin = false,
}) {
  const content = children || text;
  if (!content && content !== 0) return null;

  const classes = [];
  if (!noMargin) classes.push('ms-1');
  if (className) classes.push(className);
  if (variant === 'outline') classes.push(`lbg-outline-${color}`);
  const computedClassName = classes.join(' ') || undefined;

  return (
    <Badge
      pill
      className={computedClassName}
      bg={variant === 'solid' ? color : undefined}
    >
      {content}
    </Badge>
  );
}

LBadge.propTypes = {
  /** 'solid' for filled background, 'outline' for bordered style */
  variant: PropTypes.oneOf(['solid', 'outline']),
  /** Color key. Outline: 'default'|'primary'|'warning'|'x'. Solid: any RB bg value. */
  color: PropTypes.string.isRequired,
  /** Text content (alternative to children) */
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** React children (takes precedence over text) */
  children: PropTypes.node,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Skip default ms-1 left margin */
  noMargin: PropTypes.bool,
};

export default LBadge;
