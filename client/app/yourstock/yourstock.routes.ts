'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('yourstock', {
      url: '/yourstock',
      template: '<yourstock></yourstock>'
    });
}
