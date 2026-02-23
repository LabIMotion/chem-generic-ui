import React from 'react';
import PropTypes from 'prop-types';
import { useGenUIContext } from '@components/details/GenUIContext';
import ProgressOverview from '@components/flow/ProgressOverview';

const ProgressFlowWrapper = ({ generic, refElement }) => {
  const { showOverview, isProviderPresent } = useGenUIContext();

  const handleNodeJump = (key, isGroup) => {
    const doJump = (targetId) => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Temporary highlight effect
        element.classList.add('lu_jump-highlight');
        setTimeout(() => {
          element.classList.remove('lu_jump-highlight');
        }, 4000);
        return true;
      }
      return false;
    };

    const layerAnchorId = `_accordion_design_props_${key}`;
    const groupAnchorId = `group-anchor-${key}`;

    if (isGroup) {
      doJump(groupAnchorId);
    } else {
      // If jumping to a layer, check if we're inside a collapsed group
      const layerElement = document.getElementById(layerAnchorId);

      if (layerElement) {
        // Layer is visible, just jump
        doJump(layerAnchorId);
      } else {
        // Layer not found, might be inside a collapsed group
        const groups = generic.metadata?.groups || [];
        const parentGroup = groups.find(g => (g.layers || []).includes(key));

        if (parentGroup) {
          const groupHeader = document.querySelector(`#group-anchor-${parentGroup.id} .card-header`);
          if (groupHeader) {
            // Trigger click to expand
            groupHeader.click();

            // Wait for React to render the newly visible layers
            setTimeout(() => {
              doJump(layerAnchorId);
            }, 100);
          }
        } else {
          // No parent group, but still not found? Fallback to just trying
          doJump(layerAnchorId);
        }
      }
    }
  };

  const hasLayers = Object.keys(generic.properties?.layers || {}).length > 0;

  if (!hasLayers) return null;

  return (
    <>
      {isProviderPresent && showOverview && (
        <div className="mb-4">
          <ProgressOverview
            generic={generic}
            onNodeJump={handleNodeJump}
            refElement={refElement}
          />
        </div>
      )}
    </>
  );
};

ProgressFlowWrapper.propTypes = {
  generic: PropTypes.object.isRequired,
  refElement: PropTypes.object,
};

export default ProgressFlowWrapper;
