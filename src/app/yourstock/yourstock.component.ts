import { Component, OnInit } from '@angular/core'; 

import { NodeService } from '../node.service';
import { DataService, StockInfo } from '../data.service';

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

    mode: string = 'loading';

    edit: boolean;
    newbio: string;

    constructor(private node: NodeService, private toastr: ToastsManager, private data: DataService) {
        var that = this;

        if(!this.node.wallet) {
            this.mode = 'no-wallet';
            return;
        }

        //TODO: get/set data from the data service provider
        this.node.wallet.getAddress((err, address) => {

            that.address = address;
            that.creationInfo = JSON.parse(localStorage.getItem(address + '-stockCreationInfo')) || <any>{};

            that.node.getCreated(address, (err, created) => {
                that.creationInfo.created = created;

                that.data.getStockInfo(address, (err, info: StockInfo) => {
                    that.fullname = info.fullname;
                    that.bio = that.newbio = info.bio;
                    that.symb = info.ticker;
                    that.img = info.img;

                    that.setMode();
                    that.checkTx();

                    that.node.getBalance((err, bal) => {
                        //if(bal < config.newStockMin) {
                        //TODO: tell users to attain some coin via faucet
                        //}
                    });
                });
            });
        });
    }

    private setMode() {
        if(this.creationInfo.created) this.mode = 'created';
        else {
            if (this.creationInfo.stockExpired) this.mode = 'expired';
            else if (this.creationInfo.stockTx) this.mode = 'creating';
            else this.mode = 'new';
        }
    }

    private tryAgain() {
        this.creationInfo = <any>{};
        this.saveCreationInfo();
        this.setMode();
    }

    private checkTx() {
        if((this.creationInfo.stockTx || '') != '' && !this.creationInfo.created)
        {
            if(this.creationInfo.stockExpire < new Date().getTime()) {
                this.creationInfo.stockExpired = true;
                this.setMode();
            } else {
                //try to get stock reciept
                var that = this;
                this.node.getTransactionReceipt(this.creationInfo.stockTx, (err, res) => {
                    if(err) {
                        that.node.err(err);
                    } else if(res) {
                        that.node.getBlockNumber((err, blockNum) => {
                            if(err) {
                                that.node.err(err);
                            } else {
                                if(blockNum.minus(Number(res.blockNumber)).isGreaterThan(that.node.coin.node.requiredConfirmations)) {
                                    that.creationInfo.created = true;
                                    localStorage.setItem(that.address + '-blockCreated', res.blockNumber);
                                    that.saveCreationInfo();
                                    that.toastr.success("Stock created!");
                                    that.setMode();
                                } else {
                                    setTimeout(() => that.checkTx(), 5000);
                                }
                            }
                        });
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

        this.node.buildCreateStockTransaction(this.address, (err, tx) => {
            if(err) return that.node.err(err);
            that.node.wallet.signTx(tx, (err, signedTx) => {
                if(err) return that.node.err(err);
                var prevMode = that.mode;
                that.mode = 'loading';
                that.node.sendSignedTransaction(signedTx, (err, txHash) => {
                    if(err) { 
                        that.mode = prevMode;
                        return that.node.err(err);
                    }
                    that.creationInfo.stockTx = txHash;
                    that.creationInfo.stockExpire = new Date().getTime() + 1000 * 60 * 60 * 24 * 2; //two days
                    that.saveCreationInfo();
                    that.setMode();
                    this.uploadImage((link) => {
                        that.img = link;
                        //TODO: update all at once
                        that.data.setImg(link);
                        that.data.setFullName(that.fullName);
                        that.data.setTicker(that.symb);
                        that.data.setBio(that.newbio || that.bio);
                    });
                });
            });
        });
    }

    imgSelect($event) {
        this.croppedDataUrl = $event;
    }

    imgReset() {
        this.croppedDataUrl = '';
    }

    uploadImage(f: (link) => void) {

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
            "data": base64
        }

        var that = this;
        $.ajax(settings).done(function (response) {
            var result = JSON.parse(response);
            f(result.data.link);
        }).fail(function(error) {
            that.node.err(error);   
        });
    }

    saveEdit() {
        //TODO: sign message with private key
        this.bio = this.newbio;
        var that = this;
        this.uploadImage((link) => {
            that.img = link;
            //TODO: update all at once
            that.data.setImg(link);
            that.data.setFullName(that.fullName);
            that.data.setTicker(that.symb);
            that.data.setBio(that.newbio || that.bio);
        });
        this.edit = false;
    }

    ngOnInit() {
    }

}
