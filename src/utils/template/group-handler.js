/**
 * Get all layers that are already assigned to any group
 */
const getAssignedLayers = (groups) => {
  const assignedLayers = new Set();
  groups.forEach((group) => {
    if (group.layers && Array.isArray(group.layers)) {
      group.layers.forEach((layer) => assignedLayers.add(layer));
    }
  });
  return assignedLayers;
};

/**
 * Get the group that contains a specific layer
 */
const getGroupByLayer = (groups, layerKey) => {
  if (!groups || !Array.isArray(groups) || !layerKey) {
    return null;
  }
  return (
    groups.find(
      (group) =>
        group.layers &&
        Array.isArray(group.layers) &&
        group.layers.includes(layerKey),
    ) || null
  );
};

/**
 * Get the group information for a specific layer
 */
const getGroupInfoByLayer = (metadata, layerKey) => {
  if (!metadata || !layerKey) {
    return null;
  }

  const groups = metadata.groups || [];
  const restrictions = metadata.restrict || {};

  const group = getGroupByLayer(groups, layerKey);
  if (!group) {
    return null;
  }

  return {
    group,
    restrict: restrictions[group.id] || null,
  };
};

/**
 * Move a group to a new position
 */
const moveGroup = (groups, sourceGroupId, targetGroupId) => {
  if (!groups || !Array.isArray(groups) || groups.length === 0) {
    return groups;
  }

  const sourceIndex = groups.findIndex((g) => g.id === sourceGroupId);
  const targetIndex = groups.findIndex((g) => g.id === targetGroupId);

  if (sourceIndex === -1 || targetIndex === -1) {
    return groups;
  }

  // Create a copy of groups array
  const updatedGroups = [...groups];

  // Swap positions
  const sourceGroup = { ...updatedGroups[sourceIndex] };
  const targetGroup = { ...updatedGroups[targetIndex] };

  const tempPosition = sourceGroup.position;
  sourceGroup.position = targetGroup.position;
  targetGroup.position = tempPosition;

  updatedGroups[sourceIndex] = sourceGroup;
  updatedGroups[targetIndex] = targetGroup;

  return updatedGroups;
};

/**
 * Validate if layers can be added to a group
 * Validation result with isValid and error message
 */
const validateLayers = (layers, klassLayers, existingGroups) => {
  if (!layers || !Array.isArray(layers) || layers.length === 0) {
    return { isValid: false, error: 'No layers provided' };
  }

  // Check if all layers exist in klass.json
  const invalidLayers = layers.filter((layer) => !klassLayers[layer]);
  if (invalidLayers.length > 0) {
    return {
      isValid: false,
      error: `Layers not found in klass.json: ${invalidLayers.join(', ')}`,
    };
  }

  // Check if any layer is already assigned to another group
  const assignedLayers = getAssignedLayers(existingGroups);
  const alreadyAssigned = layers.filter((layer) => assignedLayers.has(layer));
  if (alreadyAssigned.length > 0) {
    return {
      isValid: false,
      error: `Layers already assigned to another group: ${alreadyAssigned.join(', ')}`,
    };
  }

  return { isValid: true };
};

/**
 * Add a new group to the groups array
 * Result object with success status and message
 */
const addGroup = (groups, group, klassLayers) => {
  // Validate group structure
  if (!group || typeof group !== 'object') {
    return { success: false, error: 'Invalid group object' };
  }

  if (!group.id) {
    return { success: false, error: 'Group must have an id' };
  }

  if (!group.label) {
    return { success: false, error: 'Group must have a label' };
  }

  // Check if group with same id already exists
  if (groups.some((g) => g.id === group.id)) {
    return {
      success: false,
      error: `Group with id '${group.id}' already exists`,
    };
  }

  // Validate layers if klassLayers is provided
  if (klassLayers) {
    const validation = validateLayers(group.layers, klassLayers, groups);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
  }

  // Ensure layers is an array
  if (!group.layers || !Array.isArray(group.layers)) {
    return { success: false, error: 'Group must have a layers array' };
  }

  // Add the group
  const newGroup = {
    id: group.id,
    label: group.label,
    layers: [...group.layers], // Create a copy of the array
  };

  // Preserve position if provided
  if (group.position !== undefined && group.position !== null) {
    newGroup.position = group.position;
  }

  groups.push(newGroup);

  return {
    success: true,
    message: `Group '${group.label}' added successfully with ${group.layers.length} layer(s)`,
  };
};

/**
 * Remove a group from the groups array
 * Result object with success status and message
 */
const removeGroup = (groups, groupId) => {
  const index = groups.findIndex((g) => g.id === groupId);
  if (index !== -1) {
    const removedGroup = groups.splice(index, 1)[0];
    return {
      success: true,
      message: `Group '${removedGroup.label}' removed successfully`,
    };
  }
  return { success: false, error: `Group with id '${groupId}' not found` };
};

/**
 * Add a layer to an existing group
 * Result object with success status and message
 */
const addLayerToGroup = (groups, groupId, layerKey, klassLayers) => {
  // Check if layer exists
  if (klassLayers && !klassLayers[layerKey]) {
    return {
      success: false,
      error: `Layer '${layerKey}' not found`,
    };
  }

  // Find the group
  const group = groups.find((g) => g.id === groupId);
  if (!group) {
    return { success: false, error: `Group with id '${groupId}' not found` };
  }

  // Check if layer is already in this group
  if (group.layers && group.layers.includes(layerKey)) {
    return {
      success: false,
      error: `Layer '${layerKey}' already in this group`,
    };
  }

  // Check if layer is already assigned to another group
  const assignedLayers = getAssignedLayers(groups);
  if (assignedLayers.has(layerKey)) {
    return {
      success: false,
      error: `Layer '${layerKey}' is already assigned to another group`,
    };
  }

  // Add the layer to the group
  if (!group.layers) {
    group.layers = [];
  }
  group.layers.push(layerKey);

  return {
    success: true,
    message: `Layer '${layerKey}' added to group '${group.label}' successfully`,
  };
};

/**
 * Remove a layer from a group
 * Result object with success status and message
 */
const removeLayerFromGroup = (groups, groupId, layerKey) => {
  // Find the group
  const group = groups.find((g) => g.id === groupId);
  if (!group) {
    return { success: false, error: `Group with id '${groupId}' not found` };
  }

  // Check if layer exists in this group
  if (!group.layers || !group.layers.includes(layerKey)) {
    return {
      success: false,
      error: `Layer '${layerKey}' not found in this group`,
    };
  }

  // Remove the layer from the group
  group.layers = group.layers.filter((key) => key !== layerKey);

  return {
    success: true,
    message: `Layer '${layerKey}' removed from group '${group.label}' successfully`,
    isEmpty: group.layers.length === 0, // Indicate if group is now empty
  };
};

/**
 * Get available layers that are not yet assigned to any group
 */
const getAvailableLayers = (klassLayers, existingGroups) => {
  const assignedLayers = getAssignedLayers(existingGroups);
  return Object.keys(klassLayers).filter(
    (layerKey) => !assignedLayers.has(layerKey),
  );
};

/**
 * Organize layers for display with grouping logic
 * Groups and ungrouped layers are ordered by position
 * Layers within a group maintain their own position order
 */
const organizeLayersForDisplay = (klassLayers, groups = []) => {
  if (!klassLayers || typeof klassLayers !== 'object') {
    return [];
  }

  const assignedLayers = getAssignedLayers(groups);
  const displayItems = [];

  // Create group items with their layers
  groups.forEach((group) => {
    if (!group.layers || !Array.isArray(group.layers)) {
      return;
    }

    // Get layers that belong to this group and exist in klassLayers
    const groupLayers = group.layers
      .filter((layerKey) => klassLayers[layerKey])
      .map((layerKey) => ({
        key: layerKey,
        position: klassLayers[layerKey].position || 0,
        data: klassLayers[layerKey],
      }));

    if (groupLayers.length > 0) {
      displayItems.push({
        type: 'group',
        id: group.id,
        label: group.label,
        position: group.position || 0,
        layers: groupLayers,
      });
    }
  });

  // Add ungrouped layers as individual items
  Object.keys(klassLayers).forEach((layerKey) => {
    if (!assignedLayers.has(layerKey)) {
      displayItems.push({
        type: 'layer',
        key: layerKey,
        position: klassLayers[layerKey].position || 0,
        data: klassLayers[layerKey],
      });
    }
  });

  // Sort all display items by position
  displayItems.sort((a, b) => a.position - b.position);

  return displayItems;
};

/**
 * Get the minimum position from a group's layers
 * Used to determine group position if not explicitly set
 */
const getGroupMinPosition = (group, klassLayers) => {
  if (
    !group.layers ||
    !Array.isArray(group.layers) ||
    group.layers.length === 0
  ) {
    return 0;
  }

  const positions = group.layers
    .filter((layerKey) => klassLayers[layerKey])
    .map((layerKey) => klassLayers[layerKey].position || 0);

  return positions.length > 0 ? Math.min(...positions) : 0;
};

/**
 * Update group positions based on their layers if not explicitly set
 * Modifies the groups array in place
 */
const updateGroupPositions = (groups, klassLayers) => {
  groups.forEach((group) => {
    if (group.position === undefined || group.position === null) {
      group.position = getGroupMinPosition(group, klassLayers);
    }
  });
  return groups;
};

export {
  addGroup,
  removeGroup,
  addLayerToGroup,
  removeLayerFromGroup,
  getAvailableLayers,
  validateLayers,
  organizeLayersForDisplay,
  getGroupMinPosition,
  updateGroupPositions,
  getGroupByLayer,
  getGroupInfoByLayer,
  moveGroup,
};
