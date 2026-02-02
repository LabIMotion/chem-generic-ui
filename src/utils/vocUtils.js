const VOC_IDENT = 'is_voc';
const VOC_MODE = {
  R: { value: 'read', op: 7 },
  S: { value: 'skip', op: 5 },
  W: { value: 'write', op: 6 },
};

const isNotObject = (value) => {
  return typeof value !== 'object' || value === null || Array.isArray(value);
};

const isEmptyObject = (input) => {
  return (
    typeof input === 'object' &&
    input !== null &&
    !Array.isArray(input) &&
    Object.keys(input).length === 0
  );
};

const vocMode = (fieldObject) => {
  if (isNotObject(fieldObject)) return VOC_MODE.S.value;
  if (isEmptyObject(fieldObject)) return VOC_MODE.S.value;
  if (!(VOC_IDENT in fieldObject)) return VOC_MODE.S.value;
  if (fieldObject[VOC_IDENT] === true && fieldObject?.opid >= VOC_MODE.R.op) {
    return VOC_MODE.R.value;
  }
  return VOC_MODE.W.value;
};

export { VOC_IDENT, VOC_MODE, vocMode };
