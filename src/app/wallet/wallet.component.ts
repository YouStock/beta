import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 

import { WalletConnector } from '../lib/wallet-connector';
import { NodeService } from '../node.service';
import { WEI_MULTIPLIER, TOKEN_MULTIPLIER } from '../lib/constants';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BigNumber } from 'bignumber.js';

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

    //send vars
    amount: number;
    destination: string;

    //add stock vars
    stockToAdd: string;
    addStockName: string;
    addStockNotes: string;

    constructor(private toastr: ToastsManager, public node: NodeService, private detective: ChangeDetectorRef ) { 
        this.wallet = node.wallet;
        this.unit = node.coin.unit;
        var that = this;
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

    addressClipped(e) {
        this.toastr.success(e.text, "Copied address!", { timeOut: 900 });
    }

    addStock() {
        this.node.addStock(this.stockToAdd, this.addStockName, this.addStockNotes);
    }

    send() {
        var that = this;
        var tran = this.node.buildSendTransaction(this.address, this.destination, new BigNumber(this.amount).times(WEI_MULTIPLIER));
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

    ngOnInit() {
    }

}
