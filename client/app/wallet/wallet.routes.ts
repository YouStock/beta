'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('wallet', {
      url: '/wallet',
      template: '<wallet></wallet>'
    });
}
