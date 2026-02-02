/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';

const FieldTooltip = ({ link }) => {
  if (!link) return null;
  return (
    <OverlayTrigger
      delayShow={1000}
      placement="top"
      overlay={<Tooltip id="_field_doc_tooltip">Learn more</Tooltip>}
    >
      <Button
        style={{ padding: '0' }}
        variant="link"
        href={link}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
      >
        {FIcons.faCircleQuestion}
      </Button>
    </OverlayTrigger>
  );
};

FieldTooltip.propTypes = { link: PropTypes.string.isRequired };

export default FieldTooltip;
