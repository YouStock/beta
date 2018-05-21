import * as CryptoJS from 'crypto-js';

import { WalletType } from './wallet-type';
import { Transaction } from './transaction';

import { CoreService } from '../core.service';
import { PasswordInput } from '../password/password.component';

export interface WalletConnector {
    type: WalletType;
    load(obj: any, web3: any, core: CoreService);
    getAddress(f: (err: string, result: string) => void): void;
    signTx(tx: Transaction, f: (err: string, result: string) => void): void;
    serialize(): any;
}

export class PrivateKeyConnector implements WalletConnector {

    type: WalletType = WalletType.PrivateKey;
    address: string;
    pass: string;
    encprivkey: string;
    shaprivkey: string;
    web3: any;
    core: CoreService;

    load(obj: any, web3: any, core: CoreService) {
        this.address = obj.address;
        this.encprivkey = obj.encprivkey;
        this.shaprivkey = obj.shaprivkey;
        this.web3 = web3;
        this.core = core;
    }

    getAddress(f: (err: string, result: string) => void): void {
        f(null, this.address);
    }

    signTx(tx: Transaction, f: (err: string, result: string) => void): void {
        if(!this.pass) {
            var that = this;
            //TODO: prompt for password, optionally save it, and then sign tx
            this.core.promptPassword((err, result) => {
                if(result.unlock)
                    that.pass = result.password;
                that.doSignTx(result.password, tx, f);
            });

        } else {
            this.doSignTx(this.pass, tx, f);
        }
    }

    private doSignTx(pass: string, tx: Transaction, f: (err: string, result: string) => void): void {
        var privkey;
        try {
            privkey = CryptoJS.AES.decrypt(this.encprivkey, pass).toString(CryptoJS.enc.Utf8);
        } catch(error) {
            if(error.message === 'Malformed UTF-8 data') {
                this.core.err("Invalid password.");
                return;
            }
            throw error;
        }

        if(CryptoJS.SHA256(privkey) != this.shaprivkey){
            this.core.err("Invalid password.");
            return;
        }

        this.web3.eth.accounts.signTransaction(tx, privkey, (err, signedTx) => {
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
            shaprivkey: this.shaprivkey
        };
    }
}
