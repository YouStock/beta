import { Injectable } from '@angular/core';
import { WalletConnector, PrivateKeyConnector } from './lib/wallet-connector';
import { WalletType } from './lib/wallet-type';
import { Transaction } from './lib/transaction';
import { CoinConfig } from './lib/coin-config';
import { YouStockContract } from './lib/youstock-contract';

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

    private encoded = {
        

    };

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

    getTransactionReceipt(tx: string, f: (err: any, txReceipt: any) => void) {
        this.web3.eth.getTransactionReceipt(tx, f);
    };

    getBlockNumber(f: (err, blockNum) => void): void {
        this.web3.eth.getBlockNumber(f);
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

    buildCreateStockTransaction(address: string, f: (err, tran: Transaction) => void): void {
        this.wallet.getAddress((er, ad) => {
            var contract = new this.web3.eth.Contract(YouStockContract.ABI, this.coin.node.contractAddress, {
                from: ad,
                gasPrice: Web3.utils.toWei(this.settings.gasGwei.toString(10), 'gwei')
            });

            var createStockMethod = contract.methods.createToken();

            var that = this;
            createStockMethod.estimateGas({from: ad, gas: 300000}, function(err, gas) {
                if(err)
                    fail(err);
                else {
                    var tran: Transaction = {
                        from: ad,
                        to: that.coin.node.contractAddress,
                        value: '0',
                        gas: (new BigNumber(gas.toString())).times('1.2').toFixed(0),
                        gasPrice: Web3.utils.toWei(that.settings.gasGwei.toString(10), 'gwei'),
                        chainId: that.coin.node.chainId, 
                        data: createStockMethod.encodeABI()
                    };

                    f(null, tran);
                }
            });
        });
    };

    sendSignedTransaction(signedTx: string, f: (err: any, txHash: string) => void ): void {
        this.web3.eth.sendSignedTransaction(signedTx, f);
    };

    getCreated(address: string, f: (err: any, created: boolean) => void): void {
        var contract = new this.web3.eth.Contract(YouStockContract.ABI, this.coin.node.contractAddress);
        contract.methods.created(address).call(f);
    };
}
