export default function adaptiveFixed(num: number, needNonZero: number) {
  let res = Math.trunc(num);
  let frac = Math.abs(num*1e9 - res*1e9)/1e9;
  if (frac === 0) {
    return res;
  }
  res += '.';
  let numNonZero = 0;
  while (frac !== 0 && numNonZero < needNonZero) {
    frac *= 10;
    const cur = Math.floor(frac);
    res += cur;
    frac = (Math.trunc(frac*1e9 - cur*1e9))/1e9;
    if (cur !== 0) {
      numNonZero++;
    }
  }
  return res;
}