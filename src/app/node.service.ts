import { Injectable } from '@angular/core';
import { WalletConnector, PrivateKeyConnector } from './lib/wallet-connector';
import { WalletType } from './lib/wallet-type';
import { Transaction } from './lib/transaction';
import { CoinConfig } from './lib/coin-config';

import { SettingsService } from './settings.service';

import { BigNumber } from 'bignumber.js';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

declare var require: any;
const Web3 = require('web3');

@Injectable()
export class NodeService {

    wallet: WalletConnector;
    web3: any;
    coin: CoinConfig;

    constructor(private settings: SettingsService, private toastr: ToastsManager) {
        var that = this;
        settings.subscribe(() => that.applySettings());
        this.applySettings();

        var walletData = JSON.parse(localStorage.getItem('wallet'));
        if(walletData) {
            switch(walletData.type) {
                case WalletType.PrivateKey:
                    this.wallet = new PrivateKeyConnector();
                    this.wallet.load(walletData, this.web3);
                    break;
            }
        }
    }

    err(err) {
        this.settings.err(err);
    }

    applySettings() {
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.settings.web3ProviderUrl));
        this.coin = this.settings.coin;
    }

    setWallet(wallet: WalletConnector): void {
        var that = this;
        this.wallet = wallet;
        this.saveWallet();
    }

    saveWallet() {
        var serialized = this.wallet.serialize();
        localStorage.setItem('wallet', JSON.stringify(serialized));
        this.wallet.getAddress((er, ad) => {
            if(er) {
                console.log(er);
                this.toastr.error(er);
            } else {
                var wallets = JSON.parse(localStorage.getItem('wallets')) || {};
                wallets[ad] = serialized;
                localStorage.setItem('wallets', JSON.stringify(wallets));
            }
        });
    }

    getTransactionReceipt(tx: string, handler: any){
        //TODO: 
    };

    getBalance(f: (err: any, bal: BigNumber) => void): void {
        var that = this;
        this.wallet.getAddress((err, ad) => {
            if(err) that.err(err);
            else this.web3.eth.getBalance(ad, f);
        });
    };

    getAddressBalance(address: string, f: (err: any, bal: BigNumber) => void): void {
        this.web3.eth.getBalance(address, f);
    };

    buildCreateStockTransaction(address: string): Transaction {
        //TODO;
        return null;
    };

    sendSignedTransaction(signedTx: string, f: (err: any, txHash: string) => void ): void {
        //TODO:
    };

    getCreated(address: string, f: (err: any, created: boolean) => void): void {

        //TODO
        //
        //
        //
    }



}
