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
    balance: BigNumber; 

    constructor(private toastr: ToastsManager, private node: NodeService ) { 
        this.wallet = node.wallet;
        var that = this;
        if(this.wallet) {
            node.getBalance((e, bal) => {
                if(e) that.node.err(e);
                else that.balance = bal;
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

    ngOnInit() {
    }

}
