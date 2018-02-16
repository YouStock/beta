'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './open.routes';

export class OpenComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('betaApp.openWallet', [uiRouter])
  .config(routes)
  .component('open', {
    template: require('./open.html'),
    controller: OpenComponent,
    controllerAs: 'openCtrl'
  })
  .name;
