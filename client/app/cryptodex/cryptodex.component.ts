'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './cryptodex.routes';

export class CryptodexComponent {
  /*@ngInject*/
  constructor() {
  }
}

export default angular.module('betaApp.cryptodex', [uiRouter])
  .config(routes)
  .component('cryptodex', {
    template: require('./cryptodex.html'),
    controller: CryptodexComponent,
    controllerAs: 'cryptodexCtrl'
  })
  .name;
