import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { getCondOperator } from 'generic-ui-core';

const ConditionsDisplay = ({ conditions }) => {
  const { cond_fields: condFields = [], cond_operator: matchOp = 1 } =
    conditions;

  if (!condFields.length) return null;

  const matchOpLabel = getCondOperator[matchOp];
  const condFieldsList = condFields.map((condField) => {
    const { id, layer, field, value } = condField;
    return (
      <tr key={id} className="bg-light">
        <td>{layer}</td>
        <td>{field}</td>
        <td>{value}</td>
      </tr>
    );
  });
  return (
    <>
      <div className="fw-semibold fst-italic">
        Restriction Setting: {matchOpLabel}
      </div>
      <Table size="sm" bordered responsive>
        <thead className="table-light">
          <tr>
            {['Layer', 'Field', 'Value'].map((label) => (
              <th key={label}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>{condFieldsList}</tbody>
      </Table>
    </>
  );
};

ConditionsDisplay.propTypes = {
  conditions: PropTypes.shape({
    cond_fields: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        layer: PropTypes.string,
        field: PropTypes.string,
        value: PropTypes.string,
      })
    ),
    cond_operator: PropTypes.number,
  }).isRequired,
};

export default ConditionsDisplay;
