'use strict';
const angular = require('angular');

/*@ngInject*/
export function purseService(Util, localStorageService, node) {
  var walletAddr;
  var walletHistory;
  var secureWallets;
  var activeWallets;
  var walletNodes;

  walletAddr = localStorageService.get('walletAddr');
  walletHistory = Util.getStoredObject('secureWallets') || {};
  secureWallets = Util.getStoredObject('secureWallets') || {};

  var purse = {
    setWallet(wallet) {
      walletAddr = wallet.address;
      if(!walletNodes.hasOwnProperty(wallet.type))
        walletNodes[wallet.type] = new WalletNode(wallet);
      walletHistory[wallet.address] = wallet;
      if(wallet.secure)
        secureWallets[wallet.address] = wallet;
      else
        secureWallets[wallet.address] = {
          address: wallet.address,
          source: wallet.source
        };
      localStorageService.set('walletAddr', wallet.address);
      Util.storeObject('secureWallets', secureWallets);
    },

    getWallet() {
      if(walletHistory.hasOwnProperty(walletAddr))
        return walletHistory[walletAddr];
      return null;
    },

    getBalance(cb) {
      var wallet = purse.getWallet();
      if(wallet) {
        node.getBalance(wallet.address, function(res) {
          cb(res);
        });
      }
    }   
  }
  return purse;
}

export default angular.module('betaApp.purse', [])
  .service('purse', purseService)
  .name;
