import Constants from '@components/tools/Constants';
import finder from '@components/tools/finder';

// Navigates to or opens a element
const actionFinder = (
  collection,
  useSCollection,
  type,
  id,
  els = [],
  open = false,
) => {
  const url = !isNaN(id)
    ? `${collection?.id}/${type}/${id}`
    : `${collection?.id}/${type}`;
  const path = `/${useSCollection ? 's' : ''}collection/${url}`;

  if (open) {
    const fullUrl = `/${Constants.MYDB}${path}`;
    window.open(fullUrl, '_blank');
    return null;
  }

  const action = finder(type, els);
  if (!action) {
    return null;
  }
  window.history.pushState({}, '', path);
  return action;
};

export default actionFinder;
