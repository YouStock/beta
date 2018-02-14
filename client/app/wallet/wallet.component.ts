'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './wallet.routes';

export class WalletComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('betaApp.wallet', [uiRouter])
  .config(routes)
  .component('wallet', {
    template: require('./wallet.html'),
    controller: WalletComponent,
    controllerAs: 'walletCtrl'
  })
  .name;
