'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './browse.routes';

export class BrowseComponent {
  /*@ngInject*/
  constructor() {
  }
}

export default angular.module('betaApp.browse', [uiRouter])
  .config(routes)
  .component('browse', {
    template: require('./browse.html'),
    controller: BrowseComponent,
    controllerAs: 'browseCtrl'
  })
  .name;
