'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('cryptodex', {
      url: '/cryptodex',
      template: '<cryptodex></cryptodex>'
    })
    .state('cryptodex.market', {
      url: '/cryptodex/:coin/:base',
      template: '<cryptodex></cryptodex>'
    });
}
