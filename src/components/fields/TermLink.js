/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import FIcons from '../icons/FIcons';

const TermLink = _ontology => {
  if (!_ontology) return null;
  const { label, iri, ontology_prefix: ontologyPrefix } = _ontology;
  const TIB = `https://service.tib.eu/ts4tib/ontologies/${ontologyPrefix}/terms?iri=`;
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
        className="btn-gxs"
        bsStyle="link"
        href={`${TIB}${encodeURIComponent(iri)}`}
        target="_blank"
        onClick={e => e.stopPropagation()}
      >
        {FIcons.faCircleQuestion}
      </Button>
    </OverlayTrigger>
  );
};

export default TermLink;
