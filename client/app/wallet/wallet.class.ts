'use strict';
const Web3 = require('web3');
const types = require('./wallet.types');

class YouStockWallet {
  public type;
  public wallet; 
  public web3;

  constructor(typeName, wallet) {
    this.wallet = wallet;
    this.type = types[typeName];
    if(!this.type)
      console.log('unknown wallet type');

    this.web3 = new Web3(new Web3.providers.HttpProvider(this.type.nodeUrl));
  }
}
