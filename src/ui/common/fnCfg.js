import { FN } from '@ui/common/fnConstants';

export const permitFN = (fnID) => {
  return FN[fnID] ?? true;
}
