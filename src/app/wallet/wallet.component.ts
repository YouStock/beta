import { Component, OnInit } from '@angular/core';

import { WalletConnector } from '../lib/wallet-connector';
import { NodeService } from '../node.service';

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

    constructor(private toastr: ToastsManager, private node: NodeService ) { 
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
                        else
                            that.balance = bal;
                    });
                }
            });
        }
    }

    addressClipped(e) {
        this.toastr.success(e.text, "Copied address!", { timeOut: 900 });
    }

    ngOnInit() {
    }

}
