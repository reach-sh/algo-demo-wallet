const algosdk = require('algosdk');
const algosdk_transaction = require('algosdk/dist/cjs/src/transaction');
const {Buffer} = require('buffer');

class DemoWallet {
  constructor(opts) {
    const {connection, mnemonic, network} = opts;
    if (!connection) throw Error(`connection required`);
    if (!mnemonic) throw Error(`mnemonic required`);
    // network not required

    const {sk, addr} = algosdk.mnemonicToSecretKey(mnemonic);

    this.enabled = false;
    this.sk = sk;
    this.accounts = [addr];
    this.connection = connection;
    this.network = network;
    this.algodv2 = null;
    this.indexer = null;
  }

  async enable(eopts) {
    if (this.network && eopts.network !== this.network) {
      throw Error(`This DemoWallet is only valid for "${this.network}", not for "${eopts.network}"`);
    }
    this.network = eopts.network;

    const {network, connection, accounts} = this;
    if (!network) {
      throw Error(`No network selected`);
    }
    const c = connection[network];
    if (!c) {
      throw Error(`Connection info not found for ${network}, only have info for: ${Object.keys(connection).join(', ')}`);
    }
    if (!c.algodv2 || !c.indexer) {
      throw Error(`Missing connection info for ${network}`);
    }

    this.algodv2 = new algosdk.Algodv2(c.algodv2.token, c.algodv2.url, c.algodv2.port);
    this.indexer = new algosdk.Indexer(c.indexer.token, c.indexer.url, c.indexer.port);
    this.enabled = true;
    return {network, accounts};
  }

  _requireEnabled() {
    if (!this.enabled) throw Error('Please call enable first');
  }

  async getAlgodv2() {
    this._requireEnabled();
    return this.algodv2;
  }

  async getIndexer() {
    this._requireEnabled();
    return this.indexer;
  }

  async signTxns(txns, opts) {
    void(opts);
    this._requireEnabled();
    const {sk} = this;

    // A real wallet would prompt the user for approval here.
    console.log(`demoWallet: Signing ${txns.length} txns`);

    return txns.map((txnObj) => {
      if (Array.isArray(txnObj.signers) && txnObj.signers.length === 0) {
        // Would prefer: return txn.stxn
        // but we're keeping it compatible with ARC-0001
        return null;
      }
      const txnBuf = Buffer.from(txnObj.txn, 'base64');
      const t = algosdk_transaction.decodeUnsignedTransaction(txnBuf);
      const stxnBuf = Buffer.from(t.signTxn(sk));
      return stxnBuf.toString('base64');
    });
  }

  async postTxns(stxns) {
    this._requireEnabled();
    const bs = stxns.map((stxn) => Buffer.from(stxn, 'base64'));
    return await this.algodv2.sendRawTransaction(bs).do();
  }

  async signAndPost(txns) {
    this._requireEnabled();
    const stxns = await this.signTxns(txns);
    // Would prefer not to do this here,
    // but keeping it compatible with ARC-0001
    for (const i in stxns) {
      if (!stxns[i]) {
        stxns[i] = txns[i].stxn;
      }
    }
    return await this.postTxns(stxns);
  }
}

module.exports = {DemoWallet};
