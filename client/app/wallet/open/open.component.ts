'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routes from './open.routes';

export class OpenComponent {
  private fileReader;
  private localStorageService;
  private toastr;

  mode = 'none';

  /*@ngInject*/
  constructor(toastr, localStorageService) {
    this.localStorageService = localStorageService;
    this.toastr = toastr;
  }

  readKeystore(file)
  {
    fileReader = new FileReader();
    fileReader.onload = function(result) {
      try {
        var json = JSON.parse(result.result);
        var wallet = {};
        wallet.source = 'keystore';
        wallet.address = json.address;
        wallet.cipher = json.cyphertext;
      } catch(error) {
        this.toastr.error(error);
      }
    };
    fileReader.readAsText(file);
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
