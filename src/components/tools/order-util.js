import { sortBy } from 'lodash';

export const moveLayer = (layers, sourceKey, targetKey) => {
  if (!layers || typeof layers !== 'object') {
    console.warn('Invalid input: layers must be a non-null object');
    return {};
  }

  // Convert to array and sort by current positions
  const layerEntries = Object.entries(layers).sort(
    ([, a], [, b]) => a.position - b.position
  );

  // Find indices
  const sourceIndex = layerEntries.findIndex(([key]) => key === sourceKey);
  const targetIndex = layerEntries.findIndex(([key]) => key === targetKey);

  if (sourceIndex === -1 || targetIndex === -1) {
    console.warn('Source or target key not found');
    return { ...layers }; // Return copy of original if keys not found
  }

  // Move the layer (shift others)
  const [movedLayer] = layerEntries.splice(sourceIndex, 1);
  layerEntries.splice(targetIndex, 0, movedLayer);

  // Update all positions with multiples of 10
  return layerEntries.reduce((acc, [key, layer], index) => {
    acc[key] = { ...layer, position: index * 10 };
    return acc;
  }, {});
};

export const moveField = (fields, sourceKey, targetKey) => {
  if (!Array.isArray(fields)) {
    console.warn('Invalid input: fields must be an array');
    return [];
  }

  const fieldArray = sortBy([...fields], ['position']);

  const sourceIndex = fieldArray.findIndex(
    (field) => field.field === sourceKey
  );
  const targetIndex = fieldArray.findIndex(
    (field) => field.field === targetKey
  );

  if (sourceIndex === -1 || targetIndex === -1) {
    console.warn('Source or target key not found');
    return [...fields];
  }

  const [movedField] = fieldArray.splice(sourceIndex, 1);
  fieldArray.splice(targetIndex, 0, movedField);

  return fieldArray.map((field, index) => ({
    ...field,
    position: index * 10,
  }));
};
