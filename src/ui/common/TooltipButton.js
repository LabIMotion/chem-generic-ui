import React, { forwardRef, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import TAs from '@components/tools/TAs';

const DEFAULT_DELAY = { show: 1000, hide: 0 };
const DEFAULT_PLACEMENT = 'top';
const DEFAULT_TRIGGER = ['hover', 'focus'];

const toDelayObject = (value) => {
  if (typeof value === 'number') {
    return { show: value, hide: 0 };
  }
  if (value && typeof value === 'object') {
    return {
      show: value.show ?? DEFAULT_DELAY.show,
      hide: value.hide ?? DEFAULT_DELAY.hide,
    };
  }
  return DEFAULT_DELAY;
};

const resolveTooltipContent = (tooltip, tooltipId) => {
  if (tooltip !== undefined && tooltip !== null) {
    return tooltip;
  }
  if (!tooltipId) return null;

  const [base, rest] = tooltipId.split('.');
  const source = TAs[base];

  if (typeof source === 'function') {
    return source(rest);
  }

  return source ?? null;
};

const TooltipButton = forwardRef(
  (
    {
      tooltip,
      tooltipId,
      placement,
      delay,
      trigger,
      overlayClassName,
      overlayProps,
      wrapperClassName,
      wrapperStyle,
      children,
      ...buttonProps
    },
    ref,
  ) => {
    const [overlayId] = useState(() => `tooltip-button-${uuidv4()}`);

    const tooltipContent = useMemo(
      () => resolveTooltipContent(tooltip, tooltipId),
      [tooltip, tooltipId],
    );

    const finalDelay = useMemo(() => toDelayObject(delay), [delay]);
    const finalPlacement = placement || DEFAULT_PLACEMENT;
    const finalTrigger = trigger || DEFAULT_TRIGGER;

    const computedButtonProps = { ...buttonProps, ref };

    const buttonElement = <Button {...computedButtonProps}>{children}</Button>;

    if (!tooltipContent) {
      return buttonElement;
    }

    const disabled = Boolean(computedButtonProps.disabled);

    const wrappedButton = disabled ? (
      <span
        className={['tooltip-button-wrapper', 'd-inline-flex', wrapperClassName]
          .filter(Boolean)
          .join(' ')}
        style={{
          pointerEvents: 'auto',
          cursor: 'not-allowed',
          ...wrapperStyle,
        }}
        tabIndex={0}
      >
        {buttonElement}
      </span>
    ) : (
      buttonElement
    );

    return (
      <OverlayTrigger
        delay={finalDelay}
        placement={finalPlacement}
        trigger={finalTrigger}
        overlay={
          <Tooltip
            id={overlayId}
            className={overlayClassName}
            {...overlayProps}
          >
            {tooltipContent}
          </Tooltip>
        }
      >
        {wrappedButton}
      </OverlayTrigger>
    );
  },
);

TooltipButton.displayName = 'TooltipButton';

TooltipButton.propTypes = {
  tooltip: PropTypes.node,
  tooltipId: PropTypes.string,
  placement: PropTypes.oneOf(['top', 'right', 'bottom', 'left']),
  delay: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      show: PropTypes.number,
      hide: PropTypes.number,
    }),
  ]),
  trigger: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  overlayClassName: PropTypes.string,
  overlayProps: PropTypes.object,
  wrapperClassName: PropTypes.string,
  wrapperStyle: PropTypes.object,
  children: PropTypes.node.isRequired,
};

TooltipButton.defaultProps = {
  tooltip: undefined,
  tooltipId: undefined,
  placement: DEFAULT_PLACEMENT,
  delay: DEFAULT_DELAY,
  trigger: DEFAULT_TRIGGER,
  overlayClassName: undefined,
  overlayProps: undefined,
  wrapperClassName: undefined,
  wrapperStyle: undefined,
};

export default TooltipButton;

/**
 * Usage example:
 *
 * <TooltipButton
 *   tooltipId="sel_opt_add"
 *   placement="top"
 *   variant="primary"
 *   size="sm"
 *   onClick={handleClick}
 * >
 *   {FIcons.faPlus} Add option
 * </TooltipButton>
 *
 * -- overlayClassName and overlayProps let you tweak the <Tooltip> itself—maybe add extra padding, switch the arrow color, or supply placement="auto" with Popper options.
 *
 * <TooltipButton
 *   tooltip="Upload failed"
 *   overlayClassName="tooltip-error"
 *   overlayProps={{ popperConfig: { modifiers: [{ name: 'offset', options: { offset: [0, 12] } }] } }}
 * >
 *   Retry
 * </TooltipButton>
 *
 * -- wrapperClassName and wrapperStyle only matter when the button is disabled - these props let you control that span.
 *
 * <TooltipButton
 *   tooltip="Requires admin privileges"
 *   disabled
 *   wrapperClassName="disabled-btn-wrapper"
 *   wrapperStyle={{ display: 'inline-block', minWidth: 120 }}
 * >
 *   Delete
 * </TooltipButton>
 */
