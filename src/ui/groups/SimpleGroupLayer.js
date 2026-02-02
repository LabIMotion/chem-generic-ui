import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import cloneDeep from 'lodash/cloneDeep';
import {
  organizeLayersForDisplay,
  removeGroup,
  addGroup,
  addLayerToGroup,
  removeLayerFromGroup,
} from '@utils/template/group-handler';
import { reorderPositions } from '@utils/template/sorting-handler';
import {
  SimpleGroupPanel,
  SimpleLayerPanel,
} from '@ui/groups/SimpleLayerDisplay';

/**
 * SimpleGroupLayer - Simple display of layers with grouping
 */
function SimpleGroupLayer({ klass, klassMetadata, onMetadataChange }) {
  // Local state to manage groups
  const [currentGroups, setCurrentGroups] = useState(
    klassMetadata?.groups || [],
  );
  const [currentRestrictions, setCurrentRestrictions] = useState(
    klassMetadata?.restrict || {},
  );

  // Update local state when klassMetadata changes
  useEffect(() => {
    setCurrentGroups(klassMetadata?.groups || []);
    setCurrentRestrictions(klassMetadata?.restrict || {});
  }, [klassMetadata]);

  /**
   * Sanitize restrictions when a layer is affected by grouping changes
   * Removes:
   * 1. The layer's own restrictions
   * 2. Any restrictions that reference this layer
   */
  const sanitizeRestrictionsForLayers = (layerKeys, restrictions) => {
    const updatedRestrictions = { ...restrictions };
    const layerKeysSet = new Set(layerKeys);

    // Remove restrictions that reference any of the affected layers
    Object.keys(updatedRestrictions).forEach((restrictionKey) => {
      const restriction = updatedRestrictions[restrictionKey];
      if (restriction && restriction.cond) {
        // Filter out conditions that reference any of the affected layers
        const filteredConditions = restriction.cond.filter(
          (cond) => !layerKeysSet.has(cond.layer),
        );

        if (filteredConditions.length === 0) {
          // If no conditions remain, remove the entire restriction
          delete updatedRestrictions[restrictionKey];
        } else if (filteredConditions.length !== restriction.cond.length) {
          // If some conditions were removed, update the restriction
          updatedRestrictions[restrictionKey] = {
            ...restriction,
            cond: filteredConditions,
          };
        }
      }
    });

    return updatedRestrictions;
  };

  /**
   * Helper function to reorder positions and update state
   * Handles the common pattern of reordering positions and notifying parent
   */
  const applyReorderingAndNotify = (
    updatedKlass,
    updatedGroups,
    updatedRestrictions,
  ) => {
    // Reorder positions
    const reordered = reorderPositions(updatedKlass.layers, {
      groups: updatedGroups,
      restrict: updatedRestrictions,
    });

    // Create klass with reordered layers, then deep clone for immutability
    const klassWithReorderedLayers = cloneDeep({
      ...updatedKlass,
      layers: reordered.layers,
    });

    // Update local state
    setCurrentGroups(reordered.metadata.groups || []);
    setCurrentRestrictions(reordered.metadata.restrict || {});

    // Notify parent component about the change if callback provided
    if (onMetadataChange) {
      onMetadataChange({
        groups: reordered.metadata.groups || [],
        restrict: reordered.metadata.restrict || {},
        klass: klassWithReorderedLayers,
      });
    }
  };

  /**
   * Handle group removal
   */
  const handleRemoveGroup = (groupId) => {
    // Create a copy to modify
    const updatedGroups = [...currentGroups];

    // Find the group to get its layers before removal
    const groupToRemove = updatedGroups.find((g) => g.id === groupId);
    const layersInGroup = groupToRemove ? groupToRemove.layers : [];

    const result = removeGroup(updatedGroups, groupId);

    if (result.success) {
      // Remove the restriction for this group if it exists
      let updatedRestrictions = { ...currentRestrictions };
      delete updatedRestrictions[groupId];

      // Sanitize restrictions for all layers that were in this group
      updatedRestrictions = sanitizeRestrictionsForLayers(
        layersInGroup,
        updatedRestrictions,
      );

      // IMPORTANT: Remove each layer's own restriction from klass
      const updatedKlass = { ...klass };
      if (updatedKlass.layers) {
        layersInGroup.forEach((layerKey) => {
          if (updatedKlass.layers[layerKey]) {
            delete updatedKlass.layers[layerKey].cond_fields;
            delete updatedKlass.layers[layerKey].cond_operator;
          }
        });
      }

      // Apply reordering and notify parent
      applyReorderingAndNotify(
        updatedKlass,
        updatedGroups,
        updatedRestrictions,
      );
    }
  };

  /**
   * Handle layer assignment to group
   */
  const handleAssignToGroup = (layerKey, existingGroupId, newGroupLabel) => {
    const updatedGroups = [...currentGroups];
    let result;

    if (existingGroupId) {
      // Add to existing group
      result = addLayerToGroup(
        updatedGroups,
        existingGroupId,
        layerKey,
        klass?.layers,
      );
    } else if (newGroupLabel) {
      // Check if a group with this label already exists
      const existingGroup = updatedGroups.find(
        (g) => g.label.toLowerCase() === newGroupLabel.toLowerCase(),
      );

      if (existingGroup) {
        // Group with this name already exists, add layer to it instead
        result = addLayerToGroup(
          updatedGroups,
          existingGroup.id,
          layerKey,
          klass?.layers,
        );
      } else {
        // Create new group with this layer
        // Generate a unique ID for the new group
        const newGroupId = `${uuidv4()}-g`;

        // Get the layer's position to use as the group position
        const layerPosition = klass?.layers?.[layerKey]?.position || 0;

        const newGroup = {
          id: newGroupId,
          label: newGroupLabel,
          layers: [layerKey],
          position: layerPosition, // Use layer's position for the new group
        };

        result = addGroup(updatedGroups, newGroup, klass?.layers);
      }
    }

    if (result && result.success) {
      // Sanitize restrictions for the assigned layer
      const updatedRestrictions = sanitizeRestrictionsForLayers(
        [layerKey],
        currentRestrictions,
      );

      // IMPORTANT: Remove the layer's own restriction from klass AND
      // clean up any other layers' restrictions that reference this layer
      const updatedKlass = cloneDeep(klass);
      if (updatedKlass.layers) {
        // Remove the assigned layer's own restrictions
        if (updatedKlass.layers[layerKey]) {
          delete updatedKlass.layers[layerKey].cond_fields;
          delete updatedKlass.layers[layerKey].cond_operator;
        }

        // Clean up other layers' restrictions that reference this layer
        Object.keys(updatedKlass.layers).forEach((otherLayerKey) => {
          const layer = updatedKlass.layers[otherLayerKey];
          if (layer.cond_fields && Array.isArray(layer.cond_fields)) {
            const filteredConditions = layer.cond_fields.filter(
              (cond) => cond.layer !== layerKey,
            );

            if (filteredConditions.length === 0) {
              // Remove the entire restriction if no conditions remain
              delete layer.cond_fields;
              delete layer.cond_operator;
            } else if (filteredConditions.length !== layer.cond_fields.length) {
              // Update with filtered conditions
              layer.cond_fields = filteredConditions;
            }
          }
        });
      }

      // Apply reordering and notify parent
      applyReorderingAndNotify(
        updatedKlass,
        updatedGroups,
        updatedRestrictions,
      );
    } else if (result && result.error) {
      // Handle error (you can add a toast notification here if needed)
      console.error('Error assigning to group:', result.error);
    }
  };

  /**
   * Handle removing a layer from a group
   */
  const handleRemoveLayerFromGroup = (groupId, layerKey) => {
    const updatedGroups = [...currentGroups];
    const result = removeLayerFromGroup(updatedGroups, groupId, layerKey);

    if (result && result.success) {
      // If the group is now empty, optionally remove the group
      if (result.isEmpty) {
        removeGroup(updatedGroups, groupId);
      }

      // Sanitize restrictions for the removed layer
      const updatedRestrictions = sanitizeRestrictionsForLayers(
        [layerKey],
        currentRestrictions,
      );

      // IMPORTANT: Remove the layer's own restriction from klass AND
      // clean up any other layers' restrictions that reference this layer
      const updatedKlass = cloneDeep(klass);
      if (updatedKlass.layers) {
        // Remove the removed layer's own restrictions
        if (updatedKlass.layers[layerKey]) {
          delete updatedKlass.layers[layerKey].cond_fields;
          delete updatedKlass.layers[layerKey].cond_operator;
        }

        // Clean up other layers' restrictions that reference this layer
        Object.keys(updatedKlass.layers).forEach((otherLayerKey) => {
          const layer = updatedKlass.layers[otherLayerKey];
          if (layer.cond_fields && Array.isArray(layer.cond_fields)) {
            const filteredConditions = layer.cond_fields.filter(
              (cond) => cond.layer !== layerKey,
            );

            if (filteredConditions.length === 0) {
              // Remove the entire restriction if no conditions remain
              delete layer.cond_fields;
              delete layer.cond_operator;
            } else if (filteredConditions.length !== layer.cond_fields.length) {
              // Update with filtered conditions
              layer.cond_fields = filteredConditions;
            }
          }
        });
      }

      // Apply reordering and notify parent
      applyReorderingAndNotify(
        updatedKlass,
        updatedGroups,
        updatedRestrictions,
      );
    } else if (result && result.error) {
      // Handle error
      console.error('Error removing layer from group:', result.error);
    }
  };

  /**
   * Handle updating restrictions for a group
   */
  const handleUpdateRestriction = (groupId, restriction) => {
    const updatedRestrictions = { ...currentRestrictions };

    if (
      restriction === null ||
      !restriction.cond ||
      restriction.cond.length === 0
    ) {
      // Remove restriction
      delete updatedRestrictions[groupId];
    } else {
      // Add or update restriction
      updatedRestrictions[groupId] = restriction;
    }

    setCurrentRestrictions(updatedRestrictions);

    // Notify parent component about the change if callback provided
    if (onMetadataChange) {
      onMetadataChange({
        groups: currentGroups,
        restrict: updatedRestrictions,
      });
    }
  };

  /**
   * Handle updating restrictions for a layer
   */
  const handleUpdateLayerRestriction = (layerKey, restriction) => {
    // Notify parent to update the klass object directly
    if (onMetadataChange) {
      // Deep copy klass to avoid mutation
      const updatedKlass = cloneDeep(klass);
      if (!updatedKlass.layers) {
        updatedKlass.layers = {};
      }
      if (!updatedKlass.layers[layerKey]) {
        return; // Layer doesn't exist
      }

      if (
        restriction === null ||
        !restriction.cond ||
        restriction.cond.length === 0
      ) {
        // Remove restriction
        delete updatedKlass.layers[layerKey].cond_fields;
        delete updatedKlass.layers[layerKey].cond_operator;
      } else {
        // Add or update restriction
        updatedKlass.layers[layerKey].cond_fields = restriction.cond;
        updatedKlass.layers[layerKey].cond_operator = restriction.op;
      }

      onMetadataChange({
        groups: currentGroups,
        restrict: currentRestrictions,
        klass: updatedKlass,
      });
    }
  };

  /**
   * Simple render function for layer content
   * Only displays basic layer information
   */
  const renderLayerContent = (layer) => {
    const { data } = layer;
    const { cols } = data;
    // TEMP.
    return <span />;
    // return (
    //   <div className="text-muted small">
    //     <div>
    //       Columns: {cols || 'N/A'} | Position: {layer.position}
    //     </div>
    //   </div>
    // );
  };

  // Get organized display structure using current groups
  const displayItems = organizeLayersForDisplay(
    klass?.layers || {},
    currentGroups,
  );

  // Use organizeLayersForDisplay to respect group structure and preserve array order
  const availableLayers = [];
  displayItems.forEach((item) => {
    if (item.type === 'group') {
      item.layers.forEach((layerItem) => {
        availableLayers.push({
          key: layerItem.key,
          label: layerItem.data.label,
          fields: layerItem.data.fields || [],
        });
      });
    } else {
      availableLayers.push({
        key: item.key,
        label: item.data.label,
        fields: item.data.fields || [],
      });
    }
  });

  // Get list of all grouped layer keys
  const groupedLayerKeys = new Set();
  currentGroups.forEach((group) => {
    if (group.layers) {
      group.layers.forEach((layerKey) => groupedLayerKeys.add(layerKey));
    }
  });

  // Get ungrouped layers for restriction selection
  const ungroupedLayers = availableLayers.filter(
    (layer) => !groupedLayerKeys.has(layer.key),
  );

  return (
    <Container fluid className="p-3">
      {displayItems.length === 0 && (
        <div className="text-center text-muted py-5">
          <p>No layers available</p>
        </div>
      )}

      {displayItems.map((item) => {
        if (item.type === 'group') {
          // Get layers in this group for restriction selection
          const groupLayers = item.layers.map((layer) => ({
            key: layer.key,
            label: layer.data.label || layer.key,
            fields: layer.data.fields || [],
          }));

          // Render grouped layers
          return (
            <SimpleGroupPanel
              key={item.id}
              groupId={item.id}
              groupLabel={item.label}
              groupPosition={item.position}
              layers={item.layers}
              renderLayer={renderLayerContent}
              onRemove={handleRemoveGroup}
              onRemoveLayerFromGroup={handleRemoveLayerFromGroup}
              onUpdateRestriction={handleUpdateRestriction}
              restriction={currentRestrictions[item.id]}
              availableLayers={ungroupedLayers}
              onUpdateLayerRestriction={handleUpdateLayerRestriction}
              groupLayers={groupLayers}
              selectOptions={klass?.select_options || {}}
            />
          );
        }

        // Render individual ungrouped layer
        return (
          <SimpleLayerPanel
            key={item.key}
            layerKey={item.key}
            layerData={item.data}
            onAssignToGroup={handleAssignToGroup}
            existingGroups={currentGroups}
            onUpdateRestriction={handleUpdateLayerRestriction}
            restriction={
              item.data.cond_fields
                ? {
                    op: item.data.cond_operator ?? 1,
                    cond: item.data.cond_fields,
                  }
                : null
            }
            availableLayers={ungroupedLayers}
            selectOptions={klass?.select_options || {}}
          >
            {renderLayerContent(item)}
          </SimpleLayerPanel>
        );
      })}
    </Container>
  );
}

SimpleGroupLayer.propTypes = {
  klass: PropTypes.shape({
    layers: PropTypes.objectOf(PropTypes.object),
  }).isRequired,
  klassMetadata: PropTypes.shape({
    groups: PropTypes.arrayOf(PropTypes.object),
    restrict: PropTypes.objectOf(PropTypes.object),
  }),
  onMetadataChange: PropTypes.func,
};

SimpleGroupLayer.defaultProps = {
  klassMetadata: { groups: [], restrict: {} },
  onMetadataChange: null,
};

export default SimpleGroupLayer;
