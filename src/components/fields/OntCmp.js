import React from 'react';
import { Button } from 'react-bootstrap';
import { buildTS } from 'generic-ui-core';
import FIcons from '../icons/FIcons';
import LTooltip from '../shared/LTooltip';

const OntCmp = (_ontology, _sharp = 'link') => {
  const toUrl = buildTS(_ontology);
  if (!toUrl) return null;
  const { label } = _ontology;
  const cls = _sharp === 'link' ? '' : 'badge gu-no-pointer gu-ont-display';
  const content = _sharp === 'link' ? FIcons.faCircleQuestion : label;

  return (
    <LTooltip idf={`link_term.${label}`}>
      <Button
        bsStyle="link"
        href={toUrl}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
        className={cls}
      >
        {content}
      </Button>
    </LTooltip>
  );
};

export default OntCmp;
