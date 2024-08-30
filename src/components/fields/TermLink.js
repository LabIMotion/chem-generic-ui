/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { Button } from 'react-bootstrap';
import { buildTS } from 'generic-ui-core';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

const TermLink = (_ontology) => {
  const toUrl = buildTS(_ontology);
  if (!toUrl) return null;
  const { label } = _ontology;
  return (
    <LTooltip idf={`link_term.${label}`}>
      <Button
        bsStyle="link"
        href={toUrl}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
      >
        {FIcons.faCircleQuestion}
      </Button>
    </LTooltip>
  );
};

export default TermLink;
