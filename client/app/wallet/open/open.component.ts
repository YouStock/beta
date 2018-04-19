'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './open.routes';

//import * as Wallet from '../../../assets/Wallet.js';
declare var Wallet: any;

export class OpenComponent {
  fileReader;
  toastr;
  purse;
  $location;
  mode = 'none';

  /*@ngInject*/
  constructor(toastr, purse, $location) {
    this.toastr = toastr;
    this.purse = purse;
    this.$location = $location;
  }

  readKeystore(file)
  {
    var that=this;
    this.fileReader = new FileReader();
    this.fileReader.onload = function(evt) {
      try {
        var wallet: any = {};
        wallet.source = 'keystore';
        wallet.secure = Wallet.walletRequirePass(evt.target.result);
        wallet.json = JSON.parse(evt.target.result);
        wallet.address = wallet.json.address;
        that.purse.setWallet(wallet);
        that.$location.path('/wallet');
      } catch(error) {
        that.toastr.error(error);
      }
    };
    this.fileReader.readAsText(file);
  }
}

export default angular.module('betaApp.openWallet', [uiRouter])
  .config(routes)
  .component('open', {
    template: require('./open.html'),
    controller: OpenComponent,
    controllerAs: 'openCtrl'
  })
  .name;
