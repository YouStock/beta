import { Injectable } from '@angular/core';
import { WalletConnector, PrivateKeyConnector } from './lib/wallet-connector';
import { WalletType } from './lib/wallet-type';
import { Transaction } from './lib/transaction';
import { CoinConfig } from './lib/coin-config';
import { Order } from './lib/order';
import { YouStockContract } from './lib/youstock-contract';
import { WEI_MULTIPLIER, TOKEN_MULTIPLIER } from './lib/constants';

import { SettingsService } from './settings.service';
import { CoreService } from './core.service';

import { BigNumber } from 'bignumber.js';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ElectronService } from 'ngx-electron';


declare var require: any;
const Web3 = require('web3');
var net;

@Injectable()
export class NodeService {

    wallet: WalletConnector;
    wallets: any = {};
    walletsByName: any ={};
    walletList: any[] = [];
    web3: any;
    contract: any;
    buyEvent: any;
    sellEvent: any;
    updateEvent: any;
    coin: CoinConfig;

    eventHandle: any;

    constructor(private settings: SettingsService, private toastr: ToastsManager, private core: CoreService, private electron: ElectronService) {
        var that = this;
        net = this.electron.remote.require('net');
        settings.subscribe(() => that.applySettings());
        this.applySettings();

        var walletData = JSON.parse(localStorage.getItem(this.storageKey('wallet')));
        if(walletData) {
            switch(walletData.type) {
                case WalletType.PrivateKey:
                    this.wallet = new PrivateKeyConnector();
                    this.wallet.load(walletData, this.web3, this.core);
                    break;
            }
        }

        this.wallets = JSON.parse(localStorage.getItem(this.storageKey('wallets'))) || {};
        Object.keys(this.wallets).forEach(key => {
            if(that.wallets.hasOwnProperty(key)) {
                that.walletsByName[that.wallets[key].name] = that.wallets[key];
                that.walletList.push(that.wallets[key]);
            }
        });
    }

    isTest(): boolean {
        return this.settings.isTest();
    }

    storageKey(key: string): string {
        if(this.settings.isTest())
            return key + 'test';
        else
            return key;
    }

    err(err) {
        this.settings.err(err);
    }

    warn(msg) {
        this.settings.warn(msg);
    }

    detectChanges() {
        this.core.detectChanges();
    }

    applySettings() {
        var ipcPath = this.electron.remote.getGlobal('ipcPath');
        this.web3 = new Web3(new Web3.providers.IpcProvider(ipcPath, net));

        //TODO: optionally connect over websockets when it becomes reliable

        this.coin = this.settings.coin;
        this.contract = new this.web3.eth.Contract(YouStockContract.ABI, this.coin.node.contractAddress);
    }

    setListeners(token: string, market: any) {
        this.clearListeners();
        this.buyEvent = this.contract.events.CreatedBuy({filter: { token: token }});
        this.sellEvent = this.contract.events.CreatedSell({filter: { token: token }});
        this.updateEvent = this.contract.events.UpdatedOrder({filter: { token: token }});

        this.buyEvent.on('data', function(ev) { market.onBuy(ev); }).on('error', console.error);
        this.sellEvent.on('data', function(ev) { market.onSell(ev); }).on('error', console.error);
        this.updateEvent.on('data', function(ev) { market.onUpdate(ev); }).on('error', console.error);
    }

    clearListeners() {
        this.buyEvent.unsubscribe();
        this.sellEvent.unsubscribe();
        this.updateEvent.unsubscribe();
    }

    setWallet(wallet: WalletConnector): void {
        var that = this;
        this.wallet = wallet;
        this.saveWallet();
    }

    saveWallet() {
        var serialized = this.wallet.serialize();
        localStorage.setItem(this.storageKey('wallet'), JSON.stringify(serialized));
        this.wallet.getAddress((er, ad) => {
            if(er) {
                console.log(er);
                this.toastr.error(er);
            } else {
                var wallets = JSON.parse(localStorage.getItem(this.storageKey('wallets'))) || {};
                wallets[ad] = serialized;
                localStorage.setItem(this.storageKey('wallets'), JSON.stringify(wallets));
            }
        });
    }

    walletNameExists(name: string): boolean{
        return this.walletsByName.hasOwnProperty(name);
    }

    getTransactionReceipt(tx: string, f: (err: any, txReceipt: any) => void) {
        this.web3.eth.getTransactionReceipt(tx, f);
    };

    getBlockNumber(f: (err, blockNum: BigNumber) => void): void {
        var that = this;
        this.web3.eth.getBlockNumber((e, bn) => {
            if(e) return that.err(e);
            f(null, new BigNumber(bn));
        });
    };

    getBalance(f: (err: any, bal: BigNumber) => void): void {
        var that = this;
        this.wallet.getAddress((err, ad) => {
            if(err) that.err(err);
            else that.web3.eth.getBalance(ad, (e,r) => f(e, new BigNumber(r)));
        });
    };

    getTokenBalance(token: string, f: (err: any, bal: BigNumber) => void): void {
        var that = this;
        this.wallet.getAddress((err, ad) => {
            if(err) return that.err(err);
            that.contract.methods.balances(token, ad).call((e,r) => f(e, new BigNumber(r)));
        });
    };


    getAddressBalance(address: string, f: (err: any, bal: BigNumber) => void): void {
        this.web3.eth.getBalance(address, (e,r) => f(e, new BigNumber(r)));
    };

    buildSendTransaction(from: string, to: string, amount: BigNumber): Transaction {
        return {
            from: from,
            to: to,
            value: amount.toString(10),
            gas: '21000',
            gasPrice: Web3.utils.toWei(this.settings.gasGwei.toString(10), 'gwei'),
            chainId: this.coin.node.chainId,
            data: null
        };
    }

    buildCreateStockTransaction(address: string, f: (err, tran: Transaction) => void): void {
        var that = this;
        this.wallet.getAddress((er, ad) => {
            var createStockMethod = that.contract.methods.createToken();
            createStockMethod.estimateGas({from: ad, gas: 300000}, function(err, gas) {
                if(err)
                    that.err(err);
                else {
                    var tran: Transaction = {
                        from: ad,
                        to: that.coin.node.contractAddress,
                        value: '0',
                        gas: (new BigNumber(gas.toString())).times('2').toFixed(0),
                        gasPrice: Web3.utils.toWei(that.settings.gasGwei.toString(10), 'gwei'),
                        chainId: that.coin.node.chainId, 
                        data: createStockMethod.encodeABI()
                    };

                    f(null, tran);
                }
            });
        });
    };

    buildFillBuyTransaction(token: string, orderId: string, amount: BigNumber, f: (err, tran: Transaction) => void): void {
        var that = this;
        this.wallet.getAddress((er, ad) => {
            var fillBuyMethod = that.contract.methods.fillBuy(token, orderId, amount.toString(10));
            fillBuyMethod.estimateGas({from: ad, gas: 300000}, function(err, gas) {
                if(err)
                    that.err(err);
                else {
                    var tran: Transaction = {
                        from: ad,
                        to: that.coin.node.contractAddress,
                        value: '0',
                        gas: (new BigNumber(gas.toString())).times('2').toFixed(0),
                        gasPrice: Web3.utils.toWei(that.settings.gasGwei.toString(10), 'gwei'),
                        chainId: that.coin.node.chainId, 
                        data: fillBuyMethod.encodeABI()
                    };

                    f(null, tran);
                }
            });
        });
    }

    buildBatchSellTransaction(token: string, amount: BigNumber, price: BigNumber, orderIds: string[], f: (err, tran: Transaction) => void): void {
        var that = this;
        var gas = 100000 + 30000 * orderIds.length;
        this.wallet.getAddress((er, ad) => {
            var batchSellMethod = that.contract.methods.batchSell(token, amount.toString(10), price.toString(10), orderIds);
                    var tran: Transaction = {
                        from: ad,
                        to: that.coin.node.contractAddress,
                        value: '0',
                        gas: gas.toString(),
                        gasPrice: Web3.utils.toWei(that.settings.gasGwei.toString(10), 'gwei'),
                        chainId: that.coin.node.chainId, 
                        data: batchSellMethod.encodeABI()
                    };

                    f(null, tran);
        });
    }

    buildBatchBuyTransaction(token: string, amount: BigNumber, price: BigNumber, orderIds: string[], f: (err, tran: Transaction) => void): void {
        var that = this;
        var gas = 100000 + 30000 * orderIds.length;
        this.wallet.getAddress((er, ad) => {
            var batchBuyMethod = that.contract.methods.batchBuy(token, price.toString(10), orderIds);
                    var tran: Transaction = {
                        from: ad,
                        to: that.coin.node.contractAddress,
                        value: amount.times(price).toString(10),
                        gas: gas.toString(),
                        gasPrice: Web3.utils.toWei(that.settings.gasGwei.toString(10), 'gwei'),
                        chainId: that.coin.node.chainId, 
                        data: batchBuyMethod.encodeABI()
                    };

                    f(null, tran);
        });
    }


    sendSignedTransaction(signedTx: string, f: (err: any, txHash: string) => void ): void {
        this.web3.eth.sendSignedTransaction(signedTx, f);
    };

    getCreated(address: string, f: (err: any, created: boolean) => void): void {
        this.contract.methods.created(address).call(f);
    };

    getOwner(order: Order, token: string, f: (e, o: string) => void): void {
        if(order.buy)
        this.contract.buyOwner(token, order.id).call(f);
        else
        this.contract.sellOwner(token, order.id).call(f);
    };

    getBlockCreated(token: string, f:(e, bc: BigNumber) => void): void {
        var that = this;
        this.contract.getPastEvents('CreatedToken', {'filter': { 'token': token }, 'fromBlock' : 0}, (err, events) => {
            if(err) return that.err(err);
            if(!events.length)
                f(null, new BigNumber(0));
            else
                f(null, new BigNumber(events[0].blockNumber));
        });
    };

    subscribe(token: string, currentBlock: BigNumber, f: (e, evnt) => void): void {
        var that = this;
        if(this.eventHandle) {
            this.eventHandle.unsubscribe((res) => {
                if(res)
                    that.eventHandle = that.contract.events.allEvents({'filter': { 'token': token }, 'fromBlock': currentBlock.toString(10) } , f);
                else
                    that.err('failed to unsubscribe from previous market');
            }); 
        }
        else
        that.eventHandle = that.contract.events.allEvents({'filter': { 'token': token }, 'fromBlock': currentBlock.toString(10) } , f);
    };

    getPastEvents(token: string, from: BigNumber, to: BigNumber, f: (err, events: any[]) => void): void {
        this.contract.getPastEvents('allEvents', {'filter': { 'token': token }, 'fromBlock': from.toString(10), 'toBlock': to.toString(10)}, f);
    }

    verifySig(address: string, message: string, sig: string) {
        return this.web3.eth.accounts.recover(message, sig) == address;
    }
}
