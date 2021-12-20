const { addressToEvm, evmToAddress } = require("@polkadot/util-crypto");
const { u8aToHex } = require("@polkadot/util");

// Test is based on this Spec: https://github.com/polkadot-js/common/blob/v6.0.5/packages/util-crypto/src/address/evmToAddress.spec.ts
/* let u8a = addressToEvm("5FrLxJsyJ5x9n2rmxFwosFraxFCKcXZDngRLNectCn64UjtZ", false);
let result = u8aToHex(u8a);
console.log(result);
console.log(result == "0xd43593c715fdd31c61141abd04a99fd6822c8558"); 
 */
const addr = '5GR75aMsKBmux3L87Tt9aNqut9QpvXduNkHaagtYGkFtiVux'
// '0x4a81cff73f1b8c6d94f50EDC08A4DEe7fbC109C6'
//"0xa0df350d2637096571F7A701CBc1C5fdE30dF76A"
//0xcbD1B6C83908C27F324e5cFBb6f62d27ef9e27C4
const result = addressToEvm(addr);
console.log(result);