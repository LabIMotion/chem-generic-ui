export const defaultCondOperator = 1;

export const condOperatorOptions = [
  { label: 'Match One', value: 1 },
  { label: 'Match All', value: 9 },
  { label: 'Match None', value: 0 },
];

export const getCondOperator = Object.fromEntries(
  condOperatorOptions.map(({ value, label }) => [value, label])
);
