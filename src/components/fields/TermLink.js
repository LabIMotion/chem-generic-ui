/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import FIcons from '../icons/FIcons';
import buildTS from '../../utils/build-ts';

const TermLink = _ontology => {
  const toUrl = buildTS(_ontology);
  if (!toUrl) return null;
  const { label } = _ontology;
  return (
    <OverlayTrigger
      placement="top"
      delayShow={1000}
      overlay={
        <Tooltip id="_tooltip_what_is_this">
          {label} <br /> What is this?
        </Tooltip>
      }
    >
      <Button
        bsStyle="link"
        href={toUrl}
        target="_blank"
        onClick={e => e.stopPropagation()}
      >
        {FIcons.faCircleQuestion}
      </Button>
    </OverlayTrigger>
  );
};

export default TermLink;
