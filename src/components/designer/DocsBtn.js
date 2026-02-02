import React from 'react';
import { Button } from 'react-bootstrap';
import LTooltip from '@components/shared/LTooltip';

const DocsButton = () => (
  <LTooltip idf="docs">
    <Button
      size="sm"
      style={{ float: 'right' }}
      onClick={() =>
        window.open('https://cllinde.gitbook.io/labimotion', '_blank')
      }
    >
      Docs
    </Button>
  </LTooltip>
);

export default DocsButton;
