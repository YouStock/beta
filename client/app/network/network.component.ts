'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './network.routes';

export class NetworkComponent {
  /*@ngInject*/
  constructor() {
  }
}

export default angular.module('betaApp.network', [uiRouter])
  .config(routes)
  .component('network', {
    template: require('./network.html'),
    controller: NetworkComponent,
    controllerAs: 'networkCtrl'
  })
  .name;
