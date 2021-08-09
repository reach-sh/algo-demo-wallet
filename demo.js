const {main} = require('./dapp.js');
const {DemoWallet} = require('./DemoWallet.js');

const mnemonic = process.argv[2];

const testnetConnection = {
  algodv2: {
    url: 'https://testnet.algoexplorerapi.io',
    port: '',
    token: '',
  },
  indexer: {
    url: 'https://testnet.algoexplorerapi.io/idx',
    port: '',
    token: '',
  }
};

const wallet = new DemoWallet({
  mnemonic,
  connection: {
    'testnet-v1.0': testnetConnection,
  },
});

main(wallet);
