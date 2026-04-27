
const payosNode = require('@payos/node');
const PayOS = payosNode.PayOS;

console.log('--- PayOS Methods ---');
if (PayOS && PayOS.prototype) {
    console.log(Object.getOwnPropertyNames(PayOS.prototype));
} else {
    console.log('Cannot find PayOS prototype');
}
