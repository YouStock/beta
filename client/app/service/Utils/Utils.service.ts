'use strict';
const angular = require('angular');

/*@ngInject*/
export function UtilsService() {
	// AngularJS will instantiate a singleton by calling "new" on this function
}

export default angular.module('betaApp.Utils', [])
  .service('Utils', UtilsService)
  .name;
