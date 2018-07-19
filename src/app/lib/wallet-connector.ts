import * as CryptoJS from 'crypto-js';
import { BigNumber } from 'bignumber.js';
import { StockInfo } from '../data.service'; 

import { WalletType } from './wallet-type';
import { Transaction } from './transaction';

import { CoreService } from '../core.service';
import { PasswordInput } from '../password/password.component';

export interface WalletConnector {
    type: WalletType;
    load(obj: any, web3: any, core: CoreService);
    getAddress(f: (err: string, result: string) => void): void;
    signTx(tx: Transaction, f: (err: string, result: string) => void): void;
    signMessage(message, f: (err: string, result: string) => void): void;
    serialize(): any;
}

export class StockToken {
    address: string;
    balance: BigNumber;
}

export class PrivateKeyConnector implements WalletConnector {

    type: WalletType = WalletType.PrivateKey;
    name: string;
    address: string;
    pass: string;
    encprivkey: string;
    shaprivkey: string;
    encwords: string;
    web3: any;
    core: CoreService;
    stocks: any; // address => balance

    load(obj: any, web3: any, core: CoreService) {
        this.name = obj.name;
        this.address = obj.address;
        this.encprivkey = obj.encprivkey;
        this.shaprivkey = obj.shaprivkey;
        this.encwords = obj.encwords;
        this.web3 = web3;
        this.core = core;
        this.stocks = obj.stocks || {};
        this.loadBalances();
    }

    loadBalances() {
        Object.keys(this.stocks).forEach(k => {
            if(this.stocks.hasOwnProperty(k))
                this.stocks[k] = new BigNumber(this.stocks[k]);
        }); 
    }

    getAddress(f: (err: string, result: string) => void): void {
        f(null, this.address);
    }

    signTx(tx: Transaction, f: (err: string, result: string) => void): void {
        var that = this;
        this.getPassword( pass => { that.doSignTx(pass, tx, f); });
    }

    private getPassword(f: (pass: string) => void) {
        if(!this.pass) {
            var that = this;
            this.core.promptPassword((err, result) => {
                if(result.unlock)
                    that.pass = result.password;
                f(result.password);
            });

        } else {
            f(this.pass);
        }
    }

    signMessage(message, f: (err: string, result: string) => void): void {
        var that = this;
        this.getPassword( pass => {
            var sig = that.web3.eth.accounts.sign(message, this.getPrivateKey(pass)).signature;
            f(null, sig);
        });
    }

    private getPrivateKey(pass: string): string {
        var privkey: string;
        try {
            privkey = CryptoJS.AES.decrypt(this.encprivkey, pass).toString(CryptoJS.enc.Utf8);
        } catch(error) {
            if(error.message === 'Malformed UTF-8 data') {
                this.pass = null;
                this.core.err("Invalid password.");
                return;
            }
            throw error;
        }

        if(CryptoJS.SHA256(privkey) != this.shaprivkey){
            this.pass = null;
            this.core.err("Invalid password.");
            return;
        }

        return privkey;
    }

    private doSignTx(pass: string, tx: Transaction, f: (err: string, result: string) => void): void {
        var pkey = this.getPrivateKey(pass);
        if(!pkey) return;
        this.web3.eth.accounts.signTransaction(tx, pkey, (err, signedTx) => {
            if(err)
                f(err, null);
            else
                f(null, signedTx.rawTransaction);
        });
    }

    // returns plain json object that can be stored and restored
    serialize(): any {
        return {
            type: this.type,
            address: this.address,
            encprivkey: this.encprivkey,
            shaprivkey: this.shaprivkey,
            name: this.name,
            encwords: this.encwords,
            stocks: this.serializeStocks()
        };
    }

    serializeStocks(): any {
        var result = {};
        Object.keys(this.stocks).forEach(k => {
            if(this.stocks.hasOwnProperty(k))
                result[k] = this.stocks[k].toString(10);
        });
        return result;
    }
}
