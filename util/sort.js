const sortStrings = (a, b) => a.localeCompare(b, ['ru', 'en'], {
  caseFirst: "upper"
});

const sortNumbers = (a, b) => a - b;

const sortFunctions = {
  string: sortStrings,
  number: sortNumbers
};


export const typedSort = (arr, field, type, direction) => {
  const invert = direction === 'asc' ? 1 : -1;
  return [...arr].sort((a, b) => invert * sortFunctions[type](a[field], b[field]));
};
