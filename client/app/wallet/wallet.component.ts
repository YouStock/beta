'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './wallet.routes';
import OpenComponent from './open/open.component';

export class WalletComponent {
  wallet;
  
  /*@ngInject*/
  constructor(Util) {
    this.wallet = Util.getStoredObject("wallet");
  }
}

export default angular.module('betaApp.wallet', [uiRouter, OpenComponent])
  .config(routes)
  .component('wallet', {
    template: require('./wallet.html'),
    controller: WalletComponent,
    controllerAs: 'walletCtrl'
  })
  .name;
