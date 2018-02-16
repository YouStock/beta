'use strict';

export function routeConfig($urlRouterProvider, $locationProvider, localStorageServiceProvider) {
  'ngInject';

  $urlRouterProvider
    .otherwise('/');

  $locationProvider.html5Mode(true);

  localStorageServiceProvider.setPrefix('YouStock');
}
