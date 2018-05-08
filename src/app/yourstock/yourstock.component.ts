import { Component, OnInit } from '@angular/core'; 

import { NodeService } from '../node.service';
import { DataService } from '../data.service';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import * as $ from 'jquery';

interface StockCreationInfo {
    created: boolean;
    stockTx: string;
    stockExpire: number;
    stockExpired: boolean;
}

@Component({
    selector: 'app-yourstock',
    templateUrl: './yourstock.component.html',
    styleUrls: ['./yourstock.component.scss']
})
export class YourstockComponent implements OnInit {
    fullname: string;
    fullName: string;
    price: number;
    mktCap: number;

    address: string;

    creationInfo: StockCreationInfo = <any>{};

    exploreTx: string;

    bio: string;
    symb: string;
    img: string;

    croppedDataUrl: string = '';
    picFile: any;

    loaded: boolean;
    edit: boolean;
    newbio: string;

    constructor(private node: NodeService, private toastr: ToastsManager, private data: DataService) {
        var that = this;

        if(!this.node.wallet)
            return;

        //TODO: get/set data from the data service provider
        this.node.wallet.getAddress((err, address) => {

            that.address = address;
            var infos = JSON.parse(localStorage.getItem('stockCreationInfo'));
            if(infos)
                that.creationInfo = infos[address] || {};
            else
                that.creationInfo = <any>{};

            that.node.getCreated(address, (err, created) => {
                that.creationInfo.created = created;

                that.data.getStockInfo(address, (err, info) => {
                    that.fullname = info.fullname;
                    that.bio = that.newbio = info.bio;
                    that.symb = info.ticker;
                    that.img = info.img;

                    that.checkTx();

                    that.node.getBalance((err, bal) => {
                        //if(bal < config.newStockMin) {
                        //TODO: tell users to attain some coin via faucet
                        //}
                    });
                    that.loaded = true;
                });
            });
        });
    }

    private checkTx() {
        if((this.creationInfo.stockTx || '') != '' && !this.creationInfo.created)
        {
            if(this.creationInfo.stockExpire < new Date().getTime()) {
                this.creationInfo.stockExpired = true;
            } else {
                //try to get stock reciept
                var that = this;
                this.node.getTransactionReceipt(this.creationInfo.stockTx, (err, res) => {
                    if(err)
                    {
                        that.toastr.error(err.message);
                        console.error(err);
                    } else if(res) {
                        that.creationInfo.created = true;
                        that.saveCreationInfo();
                    } else if(window.location.pathname == '/yourstock') {
                        setTimeout(()=>{that.checkTx();}, 5000);
                    }
                });
            }
        }
    }

    private saveCreationInfo() {
        var infos: any = {};
        infos[this.address] = this.creationInfo;
        localStorage.setItem('stockCreationInfo', JSON.stringify(infos));
    }

    createStock() {
        var that = this;
        this.uploadImage();

        var tx = this.node.buildCreateStockTransaction(this.address);
        this.node.wallet.signTx(tx, (err, signedTx) => {
            that.node.sendSignedTransaction(signedTx, (err, txHash) => {
                that.creationInfo.stockTx = txHash;
                that.creationInfo.stockExpire = new Date().getTime() + 1000 * 60 * 60 * 24 * 2; //two days
                that.saveCreationInfo();
            });
        });
    }

    imgSelect($event) {
        this.croppedDataUrl = $event;
    }

    imgReset() {
        this.croppedDataUrl = '';
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
            "async": true,
            "crossDomain": true,
            "url": "https://api.imgur.com/3/image",
            "method": "POST",
            "headers": {
                "Authorization": "Client-ID 353e044256bff9e"
            },
            "processData": false,
            "contentType": false,
            "mimeType": "multipart/form-data",
            "data": "image=" + encodeURIComponent(base64)
        }

        var that = this;
        $.ajax(settings).done(function (response) {
            that.data.setImg(response.data.link);
            that.img = response.data.link;
        });
    }

    saveEdit() {
        //TODO: sign message with private key
        this.bio = this.newbio;
        this.data.setBio(this.bio);
        this.uploadImage();
        this.edit = false;
    }

    ngOnInit() {
    }

}
