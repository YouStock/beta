'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './blockchain.routes';

export class BlockchainComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('betaApp.blockchain', [uiRouter])
  .config(routes)
  .component('blockchain', {
    template: require('./blockchain.html'),
    controller: BlockchainComponent,
    controllerAs: 'blockchainCtrl'
  })
  .name;
