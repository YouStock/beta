import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as CryptoJS from 'crypto-js';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { NodeService } from '../node.service';
import { DataService } from '../data.service';
import { CoreService } from '../core.service';

import { WalletConnector, PrivateKeyConnector } from '../lib/wallet-connector';

declare var Wallet: any;

@Component({
    selector: 'app-wallet-open',
    templateUrl: './wallet-open.component.html',
    styleUrls: ['./wallet-open.component.scss']
})
export class WalletOpenComponent implements OnInit {
    mode = 'none';

    privKey: string = null; 

    password1 = null;
    password2 = null;

    error = null;
    walletList: any[];

    /*@ngInject*/
    constructor(private toastr: ToastsManager, private node: NodeService, private router: Router, private core: CoreService) {
        var that = this;
        this.walletList = node.walletList;

        var balCount = 0;
        this.walletList.forEach(wallet => {
            that.node.getAddressBalance(wallet.address, (err, bal) => {
                if(err) that.node.err(err);
                else wallet.balance = bal;
                balCount++;

                if(balCount == that.walletList.length)
                    that.node.detectChanges();
            });
        });
    }

    readKeystore(file)
    {
        var that=this;
        var fileReader = new FileReader();
        fileReader.onload = function(evt) {
            try {
                var wallet: WalletConnector = new PrivateKeyConnector(); 
                //TODO: get address and private key from MEW wallet
                that.node.setWallet(wallet);
                that.router.navigate(['/wallet']);
            } catch(error) {
                that.toastr.error(error);
            }
        };
        fileReader.readAsText(file);
    }

    loadPrivKey() {
        if(this.password1 != this.password2)
        {
            this.error = 'passwords do not match';
            return;
        }

        if(!this.privKey.startsWith('0x'))
            this.privKey = '0x' + this.privKey;

        var account = this.node.web3.eth.accounts.privateKeyToAccount(this.privKey);

        var encprivkey = CryptoJS.AES.encrypt(account.privateKey, this.password1).toString();
        var shaprivkey = CryptoJS.SHA256(account.privateKey).toString();

        var wallet: PrivateKeyConnector = new PrivateKeyConnector();
        //TODO: add names to wallets
        wallet.load({
            address: account.address.substr(2),
            encprivkey: encprivkey,
            shaprivkey: shaprivkey
        }, this.node.web3, this.core);

        this.node.setWallet(wallet);
        this.router.navigate(['/wallet']);
    }

    ngOnInit() {
    }

}
