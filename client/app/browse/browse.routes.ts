'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('browse', {
      url: '/browse',
      template: '<browse></browse>'
    });
}
