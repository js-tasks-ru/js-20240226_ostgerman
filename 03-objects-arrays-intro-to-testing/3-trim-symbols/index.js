/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (!string || typeof size === 'undefined') {
    return string;
  }
  
  let curCount = 0;
  const res = [];

  for (let curIdx = 0; curIdx < string.length; curIdx++) {
    curCount = res.length && res[res.length - 1] === string[curIdx] ?
      curCount + 1 : 1;
    if (curCount <= size) {
      res.push(string[curIdx]);
    }
  }
  return res.join('');
}
