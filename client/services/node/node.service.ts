'use strict';
const angular = require('angular');

/*@ngInject*/
export function nodeService() {
	// AngularJS will instantiate a singleton by calling "new" on this function
}

export default angular.module('betaApp.node', [])
  .service('node', nodeService)
  .name;
