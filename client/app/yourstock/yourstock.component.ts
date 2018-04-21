'use strict';
const angular = require('angular');
const config = require('../../js/config.js');

const uiRouter = require('angular-ui-router');

import routes from './yourstock.routes';

export class YourstockComponent {
    stockAddress: string;
    fullname: string;
    fullName: string;
    price: number;
    mktCap: number;

    bio: string;
    symb: string;
    img: string;

    total: number = 1000000;
    decimals: number = 18;

    croppedDataUrl: string = '';
    picFile: any;

    /*@ngInject*/
    constructor(private Auth, private node, private purse, private toastr, private localStorageService, private Modal, private $http) {
        var user = Auth.getCurrentUserSync();
        this.stockAddress = user.stockAddress;
        this.fullname = user.fullname;
        this.fullName = user.fullName;
        this.total = user.total || this.total;
        this.decimals = user.decimals || this.decimals;
        this.bio = user.bio;
        this.symb = user.symb;
        this.img = user.img;

        this.purse.getEthBalance((bal) => {
            if(bal < config.newStockMin) {
                //TODO: tell users to attain some coin via faucet
            }
        });
    }

    createStock() {
        var that = this;
        this.uploadImage();

        this.purse.getPrivateKey((err, key) => {
            this.node.createStock(this.fullName, this.symb || '', this.decimals, this.total, this.purse.getContractOwnerAddress(), key, (err: any, txHash: any) => {
                if(err) {
                    //TODO: display error
                    this.toastr.error(err.message);
                    console.error(err);
                } else {
                    var stocks = JSON.parse(this.localStorageService.get('pendingStocks') || '{}');
                    stocks[txHash] = new Date().getTime();
                    this.localStorageService.set('pendingStocks', JSON.stringify(stocks));
                    this.Modal.confirm.newToken();
                    this.Auth.setBio(this.bio);
                    this.Auth.setFullName(this.fullName);
                    this.Auth.setSymb(this.symb);
                    this.Auth.setDecimals(this.decimals);
                    this.Auth.setTotal(this.total);
                    this.Auth.setStockTx(txHash);
                    //TODO: save user data and and stock address
                }
            });
        });
    }

    uploadImage() {

        if((this.croppedDataUrl || '') == '')
            return;

        var form = new FormData();
        form.append("image", this.croppedDataUrl);

        var settings = {
            "url": "https://imgur-apiv3.p.mashape.com/3/image",
            "method": "POST",
            "headers": {
                "Authorization": "Client-ID 8349cbf354782a0",
                "X-Mashape-Key": "VLWZkcw5nZmshaFEX7QlfAbNK7lPp12bStrjsnXJKH7LFORnId",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            },
            "processData": false,
            "contentType": false,
            "mimeType": "multipart/form-data",
            "data": form
        };

        var that = this;
        this.$http(settings).then(function(result) {
            that.Auth.setImg(result.data.link);
        }, function(fail) {
            console.error(fail);
            that.toastr.error(fail.statusText);
        });
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
