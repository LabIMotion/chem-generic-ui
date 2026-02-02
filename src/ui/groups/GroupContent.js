import React from 'react';
import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-bootstrap';
import { addGroup, removeGroup, getAvailableLayers, validateLayers } from '@utils/template/group-handler';

function GroupContent({ element, metadata }) {
  const layers = element?.properties_template?.layers || {};

  if (!Object.keys(layers).length) return <>No data</>;

  return (
    <>
      <Row className="mx-0 flex-grow-1" style={{ minHeight: 0 }}>
        <Col
          md={6}
          className="h-100 border-end border-primary"
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
          }}
        >
          {/* {layersListCurrent} */}
        </Col>
        <Col
          md={6}
          className="h-100"
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            position: 'relative',
          }}
        >
          {/* {layersListNew} */}
        </Col>
      </Row>
    </>
  );
}
GroupContent.propTypes = {
  template: PropTypes.shape({}),
  metadata: PropTypes.shape({}),
};

GroupContent.defaultProps = {
  template: null,
  metadata: null,
};

export default GroupContent;
