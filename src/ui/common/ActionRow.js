import React from 'react';
import PropTypes from 'prop-types';
import { ListGroup } from 'react-bootstrap';

// A labelled action row, styled as a button rather than a list entry: its own
// border and a pointer cursor, so it reads as something to click. Fixed-width
// icon slot so the labels line up in a tidy column, with a muted hint
// underneath saying what the action does.
function ActionRow({ icon, label, hint, onClick }) {
  return (
    <ListGroup.Item
      action
      onClick={onClick}
      className="d-flex align-items-center gap-2 border rounded px-3 py-2 text-start"
      style={{ cursor: 'pointer' }}
    >
      <span
        className="text-center flex-shrink-0"
        style={{ width: '1.25rem' }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="flex-grow-1">
        <span className="d-block fw-semibold">{label}</span>
        <span className="d-block text-muted small">{hint}</span>
      </span>
    </ListGroup.Item>
  );
}

ActionRow.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  hint: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default ActionRow;
