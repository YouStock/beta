'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');
import * as CryptoJS from 'crypto-js';

import routes from './open.routes';

//import * as Wallet from '../../../assets/Wallet.js';
declare var Wallet: any;

export class OpenComponent {
    fileReader;
    toastr;
    purse;
    $location;
    mode = 'none';
    privKey = null; 

    password1 = null;
    password2 = null;

    error = null;

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

    loadPrivKey() {
        if(this.password1 != this.password2)
        {
            this.error = 'passwords do not match';
            return;
        }

        var account = this.purse.getWeb3().eth.accounts.privateKeyToAccount(this.privKey);

        var encprivkey = CryptoJS.AES.encrypt(account.privateKey, this.password1).toString();
        var shaprivkey = CryptoJS.SHA256(account.privateKey).toString();

        var wallet: any = {};
        wallet.source = 'privatekey';
        wallet.secure = true;
        wallet.address = account.address.substr(2);
        wallet.json = {
            encprivkey: encprivkey,
            shaprivkey: shaprivkey
        };

        this.purse.setWallet(wallet);
        this.$location.path('/wallet');
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
