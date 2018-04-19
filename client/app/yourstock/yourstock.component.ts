'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './yourstock.routes';

export class YourstockComponent {
    stockAddress: string;
    fullname: string;
    price: number;
    mktCap: number;

    newFullName: string;

    private _node: any;

  /*@ngInject*/
    constructor(Auth, private node) {
        var user = Auth.getCurrentUserSync();
        this.stockAddress = user.stockAddress;
        this.fullname = user.fullname;
    }

    createStock() {
        //this.node.createStock(
        //createStock: function(name: string, symb: string, decimals: number, total: number, address: string, handler: (err: any, contract: any) => void) {
    }
}

export default angular.module('betaApp.yourstock', [uiRouter])
  .config(routes)
  .component('yourstock', {
    template: require('./yourstock.html'),
    controller: YourstockComponent,
    controllerAs: 'yourstockCtrl'
  })
  .name;
