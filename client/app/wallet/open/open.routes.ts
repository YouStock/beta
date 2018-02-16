'use strict';

export default function($stateProvider) {
  'ngInject';
  $stateProvider
    .state('open', {
      url: '/wallet/open',
      template: '<open></open>'
    });
}
