import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core'; 

import { NodeService } from '../node.service';
import { DataService, StockInfo } from '../data.service';

import { ImageCropperComponent, CropperSettings } from "ngx-img-cropper";
import { ToastsManager } from 'ng2-toastr/ng2-toastr'; 
import { BigNumber } from 'bignumber.js';

import * as $ from 'jquery';

@Component({
    selector: 'app-yourstock',
    templateUrl: './yourstock.component.html',
    styleUrls: ['./yourstock.component.scss'],
})
export class YourstockComponent implements OnInit {

    /*
    //ui info vars
    fullname: string;
    bio: string;
    symb: string;
    img: string;

    //saved info
    stockInfo: StockInfo = <any>{};

    price: number;
    mktCap: number;
     */

    address: string;

    creationInfo: StockCreationInfo = <any>{};

    exploreTx: string;

    mode: string = 'loading';

    //image cropping vars 
    cropperSettings: CropperSettings;
    imgdata: any;

    @ViewChild('cropper', undefined)
    cropper: ImageCropperComponent;

    private onCropSubscription: any;


    constructor(private node: NodeService, private toastr: ToastsManager, private data: DataService, private detective: ChangeDetectorRef) {
        var that = this;

        this.cropperSettings = new CropperSettings();
        this.cropperSettings.noFileInput = true;
        this.cropperSettings.width = 3;
        this.cropperSettings.height = 4;
        this.cropperSettings.croppedWidth = 200;
        this.cropperSettings.croppedHeight = 266;
        this.cropperSettings.canvasWidth = 500;
        this.cropperSettings.canvasHeight = 400;

        this.imgdata = {};

        if(!this.node.wallet) {
            this.mode = 'no-wallet';
            return;
        }

        //TODO: get/set data from the data service provider
        this.node.wallet.getAddress((err, address) => {
            if(err) return that.node.err(err);

            that.address = address;
            that.creationInfo = JSON.parse(localStorage.getItem(that.storageKey(address + '-stockCreationInfo'))) || <any>{};

            that.node.getCreated(address, (err, created) => {
                if(err) return that.node.err(err);

                if(that.creationInfo.created != created) {
                    that.creationInfo.created = created;
                    that.saveCreationInfo();

                    if(created) 
                        that.node.addStock(address, 'Your Stock', '', '');
                }

                /*
                that.data.getStockInfo(address, (err, info: StockInfo) => {
                    if(err) return that.node.err(err);

                    if(info) {
                        that.stockInfo = info;
                        that.fullname = info.fullname;
                        that.bio =  info.bio;
                        that.symb = info.ticker;
                        that.img = info.img;
                    }
                 */

                that.setMode();
                that.checkTx();

                that.node.getBalance((err, bal) => {
                    if(err) return that.node.err(err);

                    //if(bal < config.newStockMin) {
                    //TODO: tell users to attain some coin via faucet
                    //}
                });

                that.detective.detectChanges();
                //});
            });
        });
    }

    storageKey(key: string): string {
        if(this.node.isTest())
            return key + 'test';
        return key;
    }

    private setMode() {
        if(this.creationInfo.created) this.mode = 'created';
        else {
            if (this.creationInfo.stockExpired) this.mode = 'expired';
            else if (this.creationInfo.stockTx) this.mode = 'creating';
            else this.mode = 'new';
        }
        this.detective.detectChanges();
    }

    private tryAgain() {
        this.creationInfo = <any>{};
        this.saveCreationInfo();
        this.setMode();
    }

    detect() {
        this.detective.detectChanges();
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
                                    localStorage.setItem(that.storageKey(that.address + '-blockCreated'), res.blockNumber);
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
        localStorage.setItem(this.storageKey(this.address + '-stockCreationInfo'), JSON.stringify(this.creationInfo));
    }

    createStock() {
        if(this.mode == 'edit') return this.saveEdit();

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
                    /*
                    this.uploadImage((link) => {
                        that.img = link;
                        that.data.setStockInfo({
                            fullname: that.fullname,
                            bio: that.bio,
                            ticker: that.symb,
                            img: link,
                            address: that.address
                        });
                    });
                     */
                });
            });
        });
    }


    fileChangeListener($event) {
        var image:any = new Image();
        var file:File = $event.target.files[0];
        var myReader:FileReader = new FileReader();
        var that = this;
        myReader.onloadend = function (loadEvent:any) {
            image.src = loadEvent.target.result;
            that.cropper.setImage(image);
            that.linkUpCropEvent();
        };
        myReader.readAsDataURL(file);
    }

    uploadImage(f: (link) => void) {

        if(!this.imgdata || (this.imgdata.image || '') == '')
            return;

        var bidx = this.imgdata.image.indexOf('base64,');
        if(bidx == -1)
            bidx=0;
        else
            bidx = bidx+7;
        var base64 = this.imgdata.image.substr(bidx);

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

    edit() { //TODO:
        this.mode = 'edit';
    }

    resetForm() {
        /*
        var that = this; 
        var info = this.stockInfo;
        that.fullname = info.fullname;
        that.bio = info.bio;
        that.symb = info.ticker;
        that.img = info.img;
        if(this.mode == 'edit')
            this.setMode();
         */
    }

    saveEdit() {
        //TODO: sign message with private key
        /*
        var that = this;
        this.uploadImage((link) => {
            that.img = link;
            var newInfo = {
                fullname: that.fullname,
                bio: that.bio,
                ticker: that.symb,
                img: link,
                address: that.address
            };
            that.data.setStockInfo(newInfo);
            that.stockInfo = newInfo;
        });
        this.setMode();
         */
    }

    linkUpCropEvent() {
        if(!this.onCropSubscription && this.cropper) {
            var that = this;
            this.onCropSubscription = this.cropper.onCrop.subscribe(() => that.detective.detectChanges());
        }
    }  

    ngOnDestroy() {
        if(this.onCropSubscription)
            this.onCropSubscription.unsubscribe();
    }

    ngOnInit() {}
}

interface StockCreationInfo {
    created: boolean;
    stockTx: string;
    stockExpire: number;
    stockExpired: boolean;
}
