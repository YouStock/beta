'use strict';
const angular = require('angular');
const Web3 = require('web3');
const web3 = new Web3('');

angular.module('youStockApp')
  .filter('fromWei', function() {
    return function(bigNum) {
       return web3._extend.utils.fromWei(bigNum, 'ether');         
    }
  });
