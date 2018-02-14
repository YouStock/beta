'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('blockchain', {
      url: '/blockchain',
      template: '<blockchain></blockchain>'
    });
}
