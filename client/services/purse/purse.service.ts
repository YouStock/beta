'use strict';
const angular = require('angular');

/*@ngInject*/
export function purseService(Util, localStorageService) {
  var walletAddr;
  var walletHistory;
  var secureWallets;

  walletAddr = localStorageService.get('walletAddr');
  walletHistory = Util.getStoredObject('secureWallets') || {};
  secureWallets = Util.getStoredObject('secureWallets') || {};

  var purse = {
    setWallet(wallet) {
      walletAddr = wallet.address;
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
    }
  }
  return purse;
}

export default angular.module('betaApp.purse', [])
  .service('purse', purseService)
  .name;
