/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

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
        bsStyle="link"
        bsSize="xsmall"
        href={`${TIB}${encodeURIComponent(iri)}`}
        target="_blank"
        onClick={e => e.stopPropagation()}
      >
        <i className="fa fa-question-circle" aria-hidden="true" />
      </Button>
    </OverlayTrigger>
  );
};

export default TermLink;
