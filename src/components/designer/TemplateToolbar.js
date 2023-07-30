import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, ButtonToolbar, Pager } from 'react-bootstrap';

const TemplateToolbar = ({ btnNew }) => (
  <div style={{ margin: '10px 0px' }}>
    <ButtonToolbar>
      <ButtonGroup bsSize="small">
        <Button>Template</Button>
        <Button>Preview</Button>
      </ButtonGroup>

      <ButtonGroup style={{ float: 'right' }} bsSize="small">
        <Button>Save and Release</Button>
        <Button>Save as draft</Button>
      </ButtonGroup>

      <Button style={{ float: 'right' }}>Import Template</Button>
      <Button style={{ float: 'right' }}>Workflow</Button>
    </ButtonToolbar>
  </div>
);

TemplateToolbar.propTypes = {
  btnNew: PropTypes.element,
};

TemplateToolbar.defaultProps = { btnNew: null };

export default TemplateToolbar;
