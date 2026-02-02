import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Button,
  Overlay,
  OverlayTrigger,
  Tooltip,
  Popover,
} from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';

// @TODO: Refactor this component to make the Popover position right
const LPopoverTooltip = ({ msg, fnClick, fnParams }) => {
  const [showPopover, setShowPopover] = useState(false); // State to control popover visibility
  const buttonRef = useRef(null); // Ref for the button
  const containerRef = useRef(null); // Ref for the container

  const onClick = (event) => {
    event.stopPropagation();
    fnClick(fnParams);
  };

  // Memoized callback for handling outside clicks
  const handleOutsideClick = useCallback((e) => {
    if (containerRef.current && containerRef.current.contains(e.target)) {
      // console.log('click inside');
      return;
    }
    // console.log('click outside');
    setShowPopover(false);
    document.removeEventListener('click', handleOutsideClick, false);
  }, []); // Dependencies array is empty because handleOutsideClick doesn't depend on any external values

  const togglePopover = () => {
    if (!showPopover) {
      document.addEventListener('click', handleOutsideClick, false);
    } else {
      document.removeEventListener('click', handleOutsideClick, false);
    }
    setShowPopover(!showPopover);
  };

  // Cleanup the event listener on component unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('click', handleOutsideClick, false);
    };
  }, [handleOutsideClick]);

  const tooltip = <Tooltip id="tooltip">Tooltip text here</Tooltip>;

  const popoverContent = (
    <>
      <p>{msg || `Confirm?`}</p>
      <div className="btn-toolbar">
        <Button
          size="sm"
          variant="danger"
          // aria-hidden="true"
          onClick={onClick}
          data-testid="confirm-btn-yes"
        >
          Yes
        </Button>
        <span>&nbsp;&nbsp;</span>
        <Button
          size="sm"
          variant="warning"
          onClick={() => setShowPopover(false)}
          data-testid="confirm-btn-no"
        >
          No
        </Button>
      </div>
    </>
  );

  const popover = <Popover id="popover">{popoverContent}</Popover>;

  return (
    <div
      style={{ display: 'inline-block', position: 'relative' }}
      ref={containerRef}
    >
      <OverlayTrigger
        trigger={['hover', 'focus']}
        placement="top"
        overlay={tooltip}
      >
        <Button
          variant="danger"
          size="sm"
          onClick={togglePopover}
          ref={buttonRef}
          data-testid="confirm-btn"
        >
          {FIcons.faTrashCan}
        </Button>
      </OverlayTrigger>

      <Overlay
        show={showPopover}
        target={buttonRef.current} // Position relative to the button
        placement="top"
        container={containerRef.current}
        // containerPadding={20}
        rootClose
        onHide={() => setShowPopover(false)}
      >
        {popover}
      </Overlay>
    </div>
  );
};

export default LPopoverTooltip;
