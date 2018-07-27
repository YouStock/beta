import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { NodeService } from '../node.service';
import { CoreService } from '../core.service';
import { CoinConfig } from '../lib/coin-config';
import { PrivateKeyConnector } from '../lib/wallet-connector';
import { Utils } from '../lib/utils';

import * as CryptoJS from 'crypto-js';

@Component({
    selector: 'app-wallet-new',
    templateUrl: './wallet-new.component.html',
    styleUrls: ['./wallet-new.component.scss']
})
export class WalletNewComponent implements OnInit {

    password: string = '';
    passwordRetype: string = '';
    seedWords: string;


    //TODO: consider only allowing 1 account... users probably shouldn't be sharing a trading computer since it should be left online to complete trades
    //TODO: consider allowing multiple addresses per coin for additional privacy // will be needed for bitcoin change addresses

    agree1: boolean;
    bip39 = (<any>window).bip39js; 
    walletName = "Wallet 1";

    constructor(private node: NodeService, private core: CoreService, private router: Router ) { 
        this.generateSeedWords(); 
        var counter = 2;
        while(node.walletNameExists(this.walletName)) {
            this.walletName = "Wallet " + counter;
            counter = counter + 1;
        }
    }

    public generateSeedWords() {
        this.seedWords = this.bip39.generateRandomPhrase();
        var errors = this.bip39.findPhraseErrors(this.seedWords);
        if(errors) {
            this.node.err(errors);
            this.router.navigate(['/wallet/open']);
        }
    }

    public validate(): boolean {
        var error = "";
        if(!this.agree1)
            error = error + "You must agree to seed words acknowledgements.\r\n\r\n";
        if(this.password != this.passwordRetype)
            error = error + "Passwords do not match.\r\n\r\n";
        if(!this.password || this.password.length == 0)
            this.node.warn("Blank passwords are risky!");
        if(this.node.walletNameExists(this.walletName))
            error = error + "A wallet with name " + this.walletName + " already exists.\r\n\r\n";
        if(error.length > 0)
        {
            this.node.err(error);
            return false;
        }
        return true;
    }

    public create() {
        if(!this.validate()) {
            return;
        }
        else {
            // create account
            var root = this.bip39.calcBip32RootKeyFromSeed(this.seedWords).toBase58();
            var coin: CoinConfig = this.node.coin;

            var networkKey = coin.ticker + ' - ' + coin.name;
            if(coin.ticker == 'ART') // use ethereum testnet for aura test coins
                networkKey = 'RNK - Rinkeby';

            var activeNet = this.bip39.getNetworkDict()[networkKey];
            activeNet.onSelect();
            this.bip39.setActiveNetwork(activeNet);
            var dPath = this.bip39.getBip44DerivationPath();
            var errors = this.bip39.findDerivationPathErrors(dPath);
            if(errors) {
                this.node.err(errors);
                return;
            }
            var ext = this.bip39.calcBip32ExtendedKey(dPath).toBase58();
            var data = this.bip39.deriveAddress(0);

            var encprivkey = CryptoJS.AES.encrypt(data.privkey, this.password).toString();
            var shaprivkey = CryptoJS.SHA256(data.privkey).toString();

            var encwords = CryptoJS.AES.encrypt(this.seedWords, this.password).toString();

            var wallet: PrivateKeyConnector = new PrivateKeyConnector();
            //TODO: add names to wallets
            wallet.load({
                name: this.walletName,
                address: Utils.trim0x(data.address), 
                encprivkey: encprivkey,
                shaprivkey: shaprivkey,
                encwords: encwords,
            }, this.node.web3, this.core);

            this.node.setWallet(wallet);
            this.router.navigate(['/wallet']);
        }
    }

    ngOnInit() {
    }

    submit() {
        this.create();
    }

}
