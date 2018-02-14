'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('cryptodex', {
      url: '/cryptodex',
      template: '<cryptodex></cryptodex>'
    });
}
