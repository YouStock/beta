'use strict';
const angular = require('angular');

export default angular.module('youStockApp.constants', [])
  .constant('appConfig', require('../../server/config/environment/shared'))
  .name;
