/* eslint-disable react/forbid-prop-types */
import React from 'react';
import { Button } from 'react-bootstrap';
import { buildTS } from 'generic-ui-core';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';

const TermLink = (_ontology, _text = '') => {
  const toUrl = buildTS(_ontology);
  if (!toUrl) return null;
  const { label } = _ontology;
  return (
    <LTooltip idf={`link_term.${label}`}>
      <Button
        className="p-0"
        variant="link"
        href={toUrl}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
      >
        {!_text ? FIcons.faCircleQuestion : _text}
      </Button>
    </LTooltip>
  );
};

export default TermLink;
