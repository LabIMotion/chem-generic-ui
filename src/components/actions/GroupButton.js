/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import cloneDeep from 'lodash/cloneDeep';
import GroupModal from '@components/actions/GroupModal';
import Constants from '@components/tools/Constants';
import FIcons from '@components/icons/FIcons';
import LTooltip from '@components/shared/LTooltip';
import Response from '@utils/response';
import { notifySuccess } from '@utils/template/designer-message';

function GroupButton({ generic = {}, genericType, fnSave = () => {} }) {
  const [show, setShow] = useState(false);

  if (generic?.is_new) return null;
  if (Object.keys(generic.properties_template).length === 0) return null;

  const handleSave = (updatedMetadata) => {
    const groups = updatedMetadata.groups || [];
    const updates = cloneDeep(generic);

    // Update properties_template if klass was modified
    if (updatedMetadata.klass) {
      updates.properties_template = updatedMetadata.klass;
    }

    // If there are no groups, clear data
    if (groups.length === 0) {
      updates.metadata = {};
      updates.changed = true;
      fnSave(new Response(notifySuccess(), updates));
      return;
    }

    // Clean process: remove restrictions for non-existent groups
    const validGroupIds = new Set(groups.map((group) => group.id));
    const cleanedRestrictions = {};

    Object.keys(updatedMetadata.restrict || {}).forEach((groupId) => {
      if (validGroupIds.has(groupId)) {
        cleanedRestrictions[groupId] = updatedMetadata.restrict[groupId];
      }
    });

    // Save changes
    updates.metadata = {
      groups,
      restrict: cleanedRestrictions,
    };

    updates.changed = true;
    fnSave(new Response(notifySuccess(), updates));
  };

  return (
    <>
      <LTooltip idf="group_layer">
        <Button
          className="fw-medium"
          size="sm"
          variant="primary"
          onClick={() => setShow(true)}
        >
          {FIcons.faLayerGroup} Group & {FIcons.faGears} Restrictions
        </Button>
      </LTooltip>
      <GroupModal
        generic={generic}
        genericType={genericType}
        showProps={{ show, setShow }}
        onSave={handleSave}
      />
    </>
  );
}

GroupButton.propTypes = {
  generic: PropTypes.object,
  genericType: PropTypes.oneOf([
    Constants.GENERIC_TYPES.ELEMENT,
    Constants.GENERIC_TYPES.SEGMENT,
    Constants.GENERIC_TYPES.DATASET,
  ]).isRequired,
  fnSave: PropTypes.func,
};
GroupButton.defaultProps = {
  generic: {},
  fnSave: () => {},
};
export default GroupButton;
