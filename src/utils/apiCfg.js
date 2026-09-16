const ROUTES_BASE = {
  limo: 'limo',
};
const ROUTES_DOMAIN = {
  generic_dataset: 'generic_dataset',
  users: 'users',
};

export const ROUTES = {
  GENERIC_DATASET: `${ROUTES_DOMAIN.generic_dataset}`,
  USER: `${ROUTES_BASE.limo}/${ROUTES_DOMAIN.users}`,
};
