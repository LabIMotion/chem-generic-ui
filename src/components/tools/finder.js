import sourceFinder from '@components/tools/source-finder';
import { permitTargets, srcElement } from '@components/tools/utils';
import { hasGenKlass } from '@utils/validate';

const finder = (type, els = []) => {
  const isGeneric = hasGenKlass(type, els);
  if (isGeneric) return sourceFinder[srcElement];
  if (!permitTargets.includes(type)) {
    return null;
  }
  return sourceFinder[type];
};

export default finder;
