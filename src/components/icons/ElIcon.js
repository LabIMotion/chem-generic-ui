import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { resolveIcon } from '@components/icons/fa4-to-fa7-map';

/**
 * Renders a user-configured icon as SVG (self-contained, no consumer FA dependency).
 * Resolves FA4/5/6/7 class names to FA7 SVG icons via the shim map.
 * Non-FA classes (e.g., "icon-cell_line") fall back to <i> for consumer CSS.
 */
export default function ElIcon({ iconName, style, className }) {
  if (!iconName) return null;

  const icon = resolveIcon(iconName);
  if (icon) {
    return <FontAwesomeIcon icon={icon} style={style} className={className} />;
  }

  // Fallback: non-FA classes (e.g., "icon-cell_line" from icon-finder.js)
  return (
    <i
      className={`${iconName}${className ? ` ${className}` : ''}`}
      style={style}
      aria-hidden="true"
    />
  );
}
