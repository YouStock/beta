'use strict';
const angular = require('angular');
const config = require('../../js/config.js');

const uiRouter = require('angular-ui-router');

import routes from './yourstock.routes';

export class YourstockComponent {
    stockTx: string;
    stockExpire: number;
    stockExpired: boolean;
    fullname: string;
    fullName: string;
    price: number;
    mktCap: number;

    exploreTx: string;

    bio: string;
    symb: string;
    img: string;

    total: number = 1000000;
    decimals: number = 18;

    croppedDataUrl: string = '';
    picFile: any;

    loaded: boolean;
    edit: boolean;
    newbio: string;

    /*@ngInject*/
    constructor(private Auth, private node, private purse, private toastr, private localStorageService, private Modal, private $http, private $state, private Upload) {
        var that = this;
        Auth.getCurrentUser().then((user) => {
            that.fullname = user.fullname;
            that.fullName = user.fullName;
            that.total = Number(user.total || that.total);
            that.decimals = Number(user.decimals || that.decimals);
            that.bio = that.newbio = user.bio;
            that.symb = user.symb;
            that.img = user.img;
            that.stockTx = user.stockTx;
            that.stockExpire = Number(user.stockExpire);

            that.exploreTx = that.node.getNode().exploreTx;

            that.checkTx();

            that.purse.getEthBalance((bal) => {
                if(bal < config.newStockMin) {
                    //TODO: tell users to attain some coin via faucet
                }
            });
            that.loaded = true;
        });
    }

    private checkTx() {
        if((this.stockTx || '') != '' && (this.stockAddress || '') == '')
        {
            if(this.stockExpire < new Date().getTime()) {
                this.stockExpired = true;
            } else {
                //try to get stock reciept
                var that = this;
                this.node.getTransactionReceipt(this.stockTx, (err, res) => {
                    if(err)
                    {
                        that.toastr.error(err.message);
                        console.error(err);
                    } else if(res) {
                        that.stockAddress = res.contractAddress;
                        that.Auth.setStockAddress(that.stockAddress);
                    } else if(that.$state.current.name == 'yourstock') {
                        setTimeout(()=>{that.checkTx();}, 5000);
                    }
                });
            }
        }
    }

    createStock() {
        var that = this;
        this.uploadImage();

        this.purse.getPrivateKey((err, key) => {
            that.node.createStock(that.fullName, that.symb || '', that.decimals, that.total, that.purse.getContractOwnerAddress(), key, (err: any, txHash: any) => {
                if(err) {
                    that.toastr.error(err.message);
                    console.error(err);
                } else {
                    that.stockTx = txHash;
                    that.stockExpire = new Date().getTime() + 1000 * 60 * 60 * 24 * 2; //two days
                    that.Auth.setBio(that.bio);
                    that.Auth.setFullName(that.fullName);
                    that.Auth.setSymb(that.symb);
                    that.Auth.setDecimals(that.decimals);
                    that.Auth.setTotal(that.total);
                    that.Auth.setStockTx(txHash);
                    that.Auth.setStockExpire(that.stockExpire.toFixed(0)); 
                    setTimeout(()=>{that.checkTx();}, 5000);
                }
            });
        });
    }

    uploadImage() {

        if((this.croppedDataUrl || '') == '')
            return;

        var bidx = this.croppedDataUrl.indexOf('base64,');
        if(bidx == -1)
            bidx=0;
        else
            bidx = bidx+7;
        var base64 = this.croppedDataUrl.substr(bidx);

        var settings = {
            "url": "https://api.imgur.com/3/image",
            "method": "POST",
            "headers": {
                "Authorization": "Client-ID 353e044256bff9e",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            },
            "data": "image=" + encodeURIComponent(base64)
        };

        var that = this;
        this.$http(settings).then(function(result) {
            that.Auth.setImg(result.data.data.link);
            that.img = result.data.data.link;
        }, function(fail) {
            console.error(fail);
            that.toastr.error('Error uploading image: ' + fail.statusText);
        });
    }

    saveEdit() {
        this.bio = this.newbio;
        this.Auth.setBio(this.bio);
        this.uploadImage();
        this.edit = false;
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
