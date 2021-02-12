import createMemo from 'memoizee';

const decodeUTF16LE = createMemo((binaryStr: Array<number>) => {
  const cp = [];
  for(let i = 0; i < binaryStr.length; i += 2) {
    cp.push(String.fromCharCode(binaryStr[i]))
  }
  return cp;
});

export default decodeUTF16LE;
