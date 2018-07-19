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
import { DataService } from './data.service';

import { BigNumber } from 'bignumber.js';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { ElectronService } from 'ngx-electron';


declare var require: any;
const Web3 = require('web3');
var net, ethWallet;

@Injectable()
export class NodeService {

    wallet: WalletConnector;
    wallets: any = {};
    walletsByName: any ={};
    walletList: any[] = [];
    walletStocks: any[] = [];
    web3: any;
    contract: any;
    buyEvent: any;
    sellEvent: any;
    updateEvent: any;
    coin: CoinConfig;

    eventHandle: any;

    constructor(private settings: SettingsService, private toastr: ToastsManager, private data: DataService, private core: CoreService, private electron: ElectronService) {
        var that = this;
        net = this.electron.remote.require('net');
        ethWallet = this.electron.remote.require('ethereumjs-wallet');
        settings.subscribe(() => that.applySettings());
        this.applySettings();

        var walletData = JSON.parse(localStorage.getItem(this.storageKey('wallet')));
        if(walletData) this.loadWallet(walletData); 

        this.wallets = JSON.parse(localStorage.getItem(this.storageKey('wallets'))) || {};
        Object.keys(this.wallets).forEach(key => {
            if(that.wallets.hasOwnProperty(key)) {
                that.walletsByName[that.wallets[key].name] = that.wallets[key];
                that.walletList.push(that.wallets[key]);
            }
        });
    }

    private loadWallet(walletData: any) {
        switch(walletData.type) {
            case WalletType.PrivateKey:
                this.wallet = new PrivateKeyConnector();
                this.wallet.load(walletData, this.web3, this.core);
                break;
        }

        if(this.wallet)
            this.loadWalletStocks();
    }

    selectWallet(walletData: any) {
        this.loadWallet(walletData);
        this.saveWallet();
    }

    forgetWallet(walletData: any) {
        //TODO: prompt to make sure and require password
        //TODO: remove wallet from list and storage
        this.err('Not implemented');
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

    setWallet(wallet: WalletConnector): void {
        this.wallet = wallet;
        this.loadWalletStocks();
        this.saveWallet();
    }

    private loadWalletStocks() {
        var that = this;

        if(this.wallet) {
            this.wallet.getAddress((err, adr) => {
                if(err) return that.err(err);
                that.data.getAddressStocks(adr, (stocks) => {
                    that.walletStocks = stocks;
                    that.walletStocks.forEach(s => s.balance = new BigNumber(0)); // TODO: light client: save and load balances from last checkup isntead of setting to 0 here
                    that.loadWalletStockBalances();
                });
            });
        }
    }

    loadWalletStockBalances() {
        var that = this;

        function getNextBalance(i: number): void {
            if(that.walletStocks.length > i)
            {
                that.getTokenBalance(that.walletStocks[i].address, (err, bal) => {
                    if(err) {
                        that.err(err);
                        that.detectChanges();
                        return;
                    }
                    that.walletStocks[i].balance = bal;
                    getNextBalance(i + 1);
                });
            }
            else
            that.detectChanges();
        }

        if(that.walletStocks.length > 0)
            getNextBalance(0);
    }

    addStock(address: string, name: string, notes: string, img?: string) {
        var that = this;
        if(this.wallet) {
            this.wallet.getAddress((err, adr) => {
                if(err) return that.err(err);
                that.data.addAddressStock(adr, address, name, notes, img, (s) => {
                    that.walletStocks.push(s);
                    that.getTokenBalance(address, (err, bal) => {
                        if(err) return that.err(err);
                        s.balance = bal;
                        that.detectChanges();
                    });
                });
            });
        }
    }

    saveWallet() {
        var serialized = this.wallet.serialize();
        var that = this;
        localStorage.setItem(this.storageKey('wallet'), JSON.stringify(serialized));
        this.wallet.getAddress((er, ad) => {
            if(er) {
                console.log(er);
                this.toastr.error(er);
            } else {
                var wallets = JSON.parse(localStorage.getItem(that.storageKey('wallets'))) || {};
                wallets[ad] = serialized;
                localStorage.setItem(that.storageKey('wallets'), JSON.stringify(wallets));
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
            that.getAddressTokenBalance(ad, token, f);
        });
    };

    getAddressTokenBalance(address: string, token: string, f: (err: any, bal: BigNumber) => void): void {
        this.contract.methods.balances(token, address).call((e,r) => f(e, new BigNumber(r)));
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

    buildSendStockTransaction(from: string, to: string, stock: any, amount: BigNumber): Transaction {
        var that = this;
        var gas = 100000;
        var sendStockMethod  = that.contract.methods.transfer(stock.address, to, amount.toString(10));
        var tran: Transaction = {
            from: from,
            to: that.coin.node.contractAddress,
            value: '0',
            gas: gas.toString(),
            gasPrice: Web3.utils.toWei(that.settings.gasGwei.toString(10), 'gwei'),
            chainId: that.coin.node.chainId, 
            data: sendStockMethod.encodeABI()
        };

        return tran;
    };

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

    getBlockTime(blockNum, f: (time) => void): void {
        var that = this;
        return this.web3.eth.getBlock(blockNum, (err, block) => {
            if(err)
                that.err(err);
            else
                f(block.timestamp);
        });
    }

    getPastEvents(token: string, from: BigNumber, to: BigNumber, f: (err, events: any[]) => void): void {
        this.contract.getPastEvents('allEvents', {'filter': { 'token': token }, 'fromBlock': from.toString(10), 'toBlock': to.toString(10)}, f);
    }

    verifySig(address: string, message: string, sig: string) {
        return this.web3.eth.accounts.recover(message, sig) == address;
    }

    getEthWallet() {
        return ethWallet;
    }
}
