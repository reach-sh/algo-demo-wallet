const algosdk = require('algosdk');
const {Buffer} = require('buffer');

// Trivial "DApp" that uses the wallet's features
async function main(wallet) {

  // Account discovery
  const enabled = await wallet.enable({network: 'testnet-v1.0'});
  const from = enabled.accounts[0];

  // Querying
  const algodv2 = await wallet.getAlgodv2();
  const suggestedParams = await algodv2.getTransactionParams().do();
  const txns = makeTxns(from, suggestedParams);

  // Sign and post txns
  const res = await wallet.signAndPost(txns);
  console.log(res);

};

// Giving back to TestNet faucet
const to = 'GD64YIY3TWGDMCNPP553DZPPR6LDUSFQOIJVFDPPXWEG3FVOJCCDBBHU5A';

function makeTxns(from, suggestedParams) {
  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from,
    to,
    amount: 1000,
    suggestedParams,
  });

  const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from,
    to,
    amount: 2000,
    suggestedParams,
  });

  const txs = [txn1, txn2];
  algosdk.assignGroupID(txs);

  const txn1B64 = Buffer.from(txn1.toByte()).toString('base64');
  const txn2B64 = Buffer.from(txn2.toByte()).toString('base64');

  // This example doesn't skip signing & sending the latter one
  return [
    {txn: txn1B64},
    {txn: txn2B64},
  ];
}

module.exports = {main};
