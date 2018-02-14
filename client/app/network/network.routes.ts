'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('network', {
      url: '/network',
      template: '<network></network>'
    });
}
