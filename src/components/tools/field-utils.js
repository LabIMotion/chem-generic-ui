import { ElementBase } from '@components/elements/BaseFields';

const findTypeLabel = (key) => {
  const fld = ElementBase.find((e) => e.value === key);
  return fld ? fld.label : key;
}

export default findTypeLabel;
