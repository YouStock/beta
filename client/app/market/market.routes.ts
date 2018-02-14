'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('market', {
      url: '/market',
      template: '<market></market>'
    });
}
