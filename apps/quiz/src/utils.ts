const isSuperset = (set, subset) => {
  for (const elem of subset) {
    if (!set.has(elem)) {
      return false;
    }
  }
  return true;
};

export const isSubset = (array1, array2) => {
  const set1 = new Set(array1);
  const set2 = new Set(array2);
  return isSuperset(set2, set1);
};
