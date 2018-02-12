'use strict';
const angular = require('angular');
import SignupController from './signup.controller';

export default angular.module('youStockApp.signup', [])
    .controller('SignupController', SignupController)
    .name;
