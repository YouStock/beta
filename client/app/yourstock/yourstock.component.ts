'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './yourstock.routes';

export class YourstockComponent {
  /*@ngInject*/
  constructor() {
    this.message = 'Hello';
  }
}

export default angular.module('betaApp.yourstock', [uiRouter])
  .config(routes)
  .component('yourstock', {
    template: require('./yourstock.html'),
    controller: YourstockComponent,
    controllerAs: 'yourstockCtrl'
  })
  .name;
