import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Row, Col } from 'react-bootstrap';
import FIcons from '@components/icons/FIcons';
import DotProgressBar from '@components/shared/DotProgressBar';
import {
  organizeLayersForDisplay
} from '@utils/template/group-handler';
import {
  calculateLayerCompletion,
  calculateGroupCompletion,
} from '@utils/template/flow-handler';
import {
  isItemEffectivelyVisible
} from '@utils/template/visibility-handler';

const ProgressOverview = ({ generic, onNodeJump, refElement }) => {
  const { properties, metadata = {} } = generic;
  const layers = properties?.layers || {};
  const groups = metadata.groups || [];
  const restrictions = metadata.restrict || {};
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const toggleExpand = (groupId) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const displayItems = organizeLayersForDisplay(layers, groups);

  const visibleItems = displayItems.filter(item => {
    const isGroup = item.type === 'group';
    const restriction = isGroup ? (restrictions[item.id] || {}) : item.data;
    const [isVisible] = isItemEffectivelyVisible(restriction, layers, refElement);
    return isVisible;
  });

  const renderCard = (item, isSubLayer = false) => {
    const isGroup = item.type === 'group';

    const completion = isGroup
      ? calculateGroupCompletion(item.layers.map(l => l.data), layers, refElement)
      : calculateLayerCompletion(item.data, layers, refElement);

    const isExpanded = expandedGroups.has(item.id);
    const variant = completion === 100 ? 'success' : completion > 50 ? 'warning' : 'danger';

    return (
      <Card
        key={isGroup ? `group-${item.id}` : `layer-${item.key}`}
        className={`mb-2 shadow-sm ${isSubLayer ? 'ms-3 border-start-0 bg-light' : ''}`}
        style={{ fontSize: '0.85rem', borderColor: isGroup ? '#5bc0de' : '#dee2e6', borderLeftWidth: isGroup ? '4px' : '1px' }}
      >
        <Card.Body className="p-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center text-truncate pe-2">
              {isGroup && (
                <span className="me-2 text-info" style={{ fontSize: '0.9rem', minWidth: '16px' }}>
                  {FIcons.faLayerGroup}
                </span>
              )}
              <span className={`fw-bold text-truncate ${!isGroup ? 'ps-1' : ''}`} title={isGroup ? item.label : (item.data.label || item.key)}>
                {isGroup ? item.label : (item.data.label || item.key)}
              </span>
            </div>
            <div className="d-flex align-items-center flex-shrink-0">
               <Button
                variant="light"
                size="sm"
                className="p-0 px-1 me-1"
                title="Go to section"
                onClick={() => onNodeJump(isGroup ? item.id : item.key, isGroup)}
              >
                {FIcons.faArrowDown}
              </Button>
              {isGroup && (
                <Button
                  variant="primary"
                  size="sm"
                  className="p-0 px-1"
                  title={isExpanded ? 'Collapse' : 'Expand'}
                  onClick={() => toggleExpand(item.id)}
                >
                  {isExpanded ? FIcons.faMinus : FIcons.faPlus}
                </Button>
              )}
            </div>
          </div>

          <div className="px-1">
            <div className="small text-muted mb-1" style={{ fontSize: '0.7rem' }}>Completion</div>
            <div className="d-flex align-items-center">
              <DotProgressBar
                now={completion}
                variant={variant}
                className="me-2"
                shape="square"
              />
              <span className="small text-muted fw-bold" style={{ minWidth: '35px', textAlign: 'right', fontSize: '0.75rem' }}>
                {completion}%
              </span>
            </div>
          </div>

          {isGroup && isExpanded && (
            <div className="mt-2 border-top pt-2">
              {item.layers
                .filter(layerItem => {
                  const [isVisible] = isItemEffectivelyVisible(layerItem.data, layers, refElement);
                  return isVisible;
                })
                .map(layerItem => renderCard({ ...layerItem, type: 'layer' }, true))
              }
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="prog-overview-dashboard">
      <div className="d-flex align-items-center mb-3 bg-white" style={{ lineHeight: 1 }}>
        <span className="me-2 d-flex align-items-center" style={{ fontSize: '1.1rem', transform: 'translateY(-1px)' }}>
          {FIcons.faChartBar}
        </span>
        <div className="fw-bold uppercase tracking-wider" style={{ fontSize: '0.85rem', letterSpacing: '0.05rem' }}>
          OVERVIEW MAP
        </div>
      </div>
      <Row xs={1} md={2} lg={3} xl={4} className="g-2">
        {visibleItems.map(item => (
          <Col key={item.type === 'group' ? `col-group-${item.id}` : `col-layer-${item.key}`}>
            {renderCard(item)}
          </Col>
        ))}
      </Row>
    </div>
  );
};

ProgressOverview.propTypes = {
  generic: PropTypes.object.isRequired,
  onNodeJump: PropTypes.func.isRequired,
  refElement: PropTypes.object,
};

export default ProgressOverview;
