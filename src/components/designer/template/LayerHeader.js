import React from 'react';
import PropTypes from 'prop-types';
import FIcons from '@components/icons/FIcons';
import LBadge from '@components/shared/LBadge';
import { pl } from '@components/tools/format-utils';

/**
 * Display component for rendering layer information with badges.
 * Shows layer details including key, group info, columns, fields count, and workflow status.
 */
function LayerHeader({ layer, groupInfo }) {
  const fieldsCount = layer?.fields?.length || 0;
  const hasConditionalFields = layer?.cond_fields?.length > 0;
  const hasGroupRestrictions = groupInfo?.restrict?.cond?.length > 0;

  return (
    <span className="flex-grow-1">
      {/* Group information badge */}
      {groupInfo && (
        <LBadge variant="solid" color="primary">
          Group: {groupInfo.group.label}
          {hasGroupRestrictions && <> {FIcons.faGears} </>}
        </LBadge>
      )}

      {groupInfo && ' '}

      {/* Layer label and key */}
      <span className="fw-bold">{layer.label}</span>
      <LBadge variant="solid" color="dark" text={layer.key} />

      {/* Conditional fields indicator */}
      {hasConditionalFields && (
        <LBadge variant="solid" color="warning">
          {FIcons.faGears}
        </LBadge>
      )}

      {/* Column layout and fields count */}
      <LBadge
        variant="outline"
        color="primary"
        text={`${layer.cols} ${pl(layer.cols, 'col')}/row, ${fieldsCount} ${pl(fieldsCount, 'field')}`}
      />

      {/* Workflow indicator */}
      {layer?.wf && (
        <LBadge variant="outline" color="warning" text="workflow" />
      )}
    </span>
  );
}

LayerHeader.propTypes = {
  /** Layer configuration object */
  layer: PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    cols: PropTypes.number,
    fields: PropTypes.array,
    wf: PropTypes.bool,
  }).isRequired,
  groupInfo: PropTypes.shape({
    group: PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      layers: PropTypes.array.isRequired,
      position: PropTypes.number,
    }).isRequired,
    restrict: PropTypes.object,
  }),
};

LayerHeader.defaultProps = {
  groupInfo: null,
};

export default LayerHeader;
