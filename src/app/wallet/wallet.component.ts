import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 

import { WalletConnector } from '../lib/wallet-connector';
import { NodeService } from '../node.service';
import { WEI_MULTIPLIER, TOKEN_MULTIPLIER } from '../lib/constants';
import { Utils } from '../lib/utils';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BigNumber } from 'bignumber.js';

const Web3 = require('web3');

@Component({
    selector: 'app-wallet',
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

    wallet: WalletConnector;
    address: string;
    balance: BigNumber; 
    unit: string;
    sendUnit: string;
    sendStock: any;

    //send vars
    amount: number;
    destination: string;

    //add stock vars
    stockToAdd: string;
    addStockName: string;
    addStockNotes: string;

    track: boolean = false;

    //TODO: add way to remove tracked stocks

    constructor(private toastr: ToastsManager, public node: NodeService, private detective: ChangeDetectorRef ) { 
        this.unit = node.coin.unit;
        this.sendUnit = this.unit;
        this.initWallet();
    }

    private initWallet() {
        var that = this;
        this.wallet = this.node.wallet;
        if(this.wallet) {
            this.wallet.getAddress((err, adr) => {
                if(err) that.node.err(err);
                else {
                    that.address = adr;
                    that.node.getAddressBalance(adr, (err, bal) => {
                        if(err) that.node.err(err);
                        else {
                            that.balance = bal;
                            that.detective.detectChanges();
                        }
                    });
                }
            });
        }
    }

    zeroX(address: string): string {
        return Utils.zeroX(address);
    }

    selectUnit(stock) {
        this.sendStock = stock;
        this.sendUnit = stock ? stock.name : this.unit;
    }

    toggleTrack() { 
        if(this.track)
            this.stockToAdd = this.addStockName = this.addStockNotes = "";
        this.track = !this.track; 
    }

    addressClipped(e) {
        this.toastr.success(e.text, "Copied address!", { timeOut: 900 });
    }

    addStock() {
        if(Web3.utils.isAddress(this.stockToAdd)) {
        this.node.addStock(this.stockToAdd, this.addStockName, this.addStockNotes);
            this.toggleTrack();
        } else
            this.node.warn("Invalid stock address");
    }

    send() {
        var that = this;
        var tran;
        //TODO: prompt are you sure dialog
        if(this.sendStock) {
            tran = this.node.buildSendStockTransaction(this.address, this.destination, this.sendStock, new BigNumber(this.amount).times(TOKEN_MULTIPLIER));
        } else {
            tran = this.node.buildSendTransaction(this.address, this.destination, new BigNumber(this.amount).times(WEI_MULTIPLIER));
        }
        this.wallet.signTx(tran, (err, signedTx) => {
            if(err) return that.node.err(err);
            that.node.sendSignedTransaction(signedTx, (err, txHash) => {
                if(err) return that.node.err(err);
                that.toastr.success("Transaction sent " + txHash); //TODO: make txHash a clickable link, and save tx history
                that.destination = '';
                that.amount = null;
                that.detective.detectChanges();
            });
        }); 
    }

    selectWallet(wlt) {
        this.node.selectWallet(wlt);
        this.initWallet();
    }

    forgetWallet(wlt, evt) {
        this.node.forgetWallet(wlt);
        evt.preventDefault();
        evt.stopPropagation();
    }

    ngOnInit() {

    }
}
