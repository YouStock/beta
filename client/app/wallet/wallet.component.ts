'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');
var QRCode = require('qrcode')

import routes from './wallet.routes';
import OpenComponent from './open/open.component';

export class WalletComponent {
    wallet;
    toastr;
    balance;
    qrCodeUrl;
    unit;

    //TODO: show list of recent wallets for this userId 
    /*@ngInject*/
    constructor(purse, toastr) {
        this.wallet = purse.getWallet("wallet");
        this.toastr = toastr;
        this.unit = purse.getUnit();
        var self = this;

        if(this.wallet) {
            purse.getBalance(function(res) {
                self.balance = res;
            });

            QRCode.toDataURL(this.wallet.address, (err, url) => {
                if(err)
                    console.error(err)
                else
                    self.qrCodeUrl = url;
            });
        }
    }

    addressClipped(e) {
        this.toastr.success(e.text, "Copied address!", { timeOut: 900 });
    }
}

export default angular.module('betaApp.wallet', [uiRouter, OpenComponent])
    .config(routes)
    .component('wallet', {
        template: require('./wallet.html'),
        controller: WalletComponent,
        controllerAs: 'walletCtrl'
    })
    .name;
