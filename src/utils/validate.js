// Check if it's a generic klass
const hasGenKlass = (klass, els) => klass && els.some((el) => el.name === klass);

// Determine if drag-and-drop should be enabled
const useDnD = (element, klasses) =>
  hasGenKlass(element?.type, klasses) || (element?.segments || []).length > 0;

export { hasGenKlass, useDnD };
