import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

const DocsButton = () => (
  <OverlayTrigger
    placement="top"
    overlay={<Tooltip id="_tooltip_documentation">Docs</Tooltip>}
  >
    <Button
      style={{ float: 'right' }}
      bsSize="xsmall"
      onClick={() =>
        window.open('https://cllinde.gitbook.io/labimotion', '_blank')
      }
    >
      Docs
    </Button>
  </OverlayTrigger>
);

export default DocsButton;
