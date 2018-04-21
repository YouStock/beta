'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './market.routes';

export class MarketComponent {
  /*@ngInject*/
  constructor(Auth) {
                    Auth.setBio('test');
  }
}

export default angular.module('betaApp.market', [uiRouter])
  .config(routes)
  .component('market', {
    template: require('./market.html'),
    controller: MarketComponent,
    controllerAs: 'marketCtrl'
  })
  .name;
