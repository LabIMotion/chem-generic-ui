/* eslint-disable react/forbid-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import GenInterface from '@components/details/GenInterface';

const SegmentCriteria = (props) => {
  const { segment, onChange } = props;
  if (!segment) return null;
  const title = (
    <Row key="criteria_init">
      <Col md={12} style={{ fontWeight: 'bold', fontStyle: 'italic', fontSize: 'large' }}>
        {segment.label} ({segment.desc})
      </Col>
    </Row>
  );

  segment.properties = segment.properties_release;
  const layersLayout = (
    <GenInterface
      generic={segment}
      fnChange={onChange}
      extLayers={[]}
      genId={segment.id || 0}
      isPreview={false}
      isActiveWF
      isSearch
      fnNavi={() => {}}
    />
  );
  return (
    <div style={{ margin: '15px' }}>{title}{layersLayout}</div>
  );
};

SegmentCriteria.propTypes = { segment: PropTypes.object, onChange: PropTypes.func };
SegmentCriteria.defaultProps = { segment: {}, onChange: () => {} };

export default SegmentCriteria;
