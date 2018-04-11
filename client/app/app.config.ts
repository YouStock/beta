'use strict';
const angular = require('angular');

export function routeConfig($urlRouterProvider, $locationProvider, localStorageServiceProvider, toastrConfig) {
  'ngInject';

  $urlRouterProvider
    .otherwise('/');

  $locationProvider.html5Mode(true);

  localStorageServiceProvider.setPrefix('YouStock');

  angular.extend(toastrConfig, {
    positionClass: 'toast-bottom-right'
  });
}
