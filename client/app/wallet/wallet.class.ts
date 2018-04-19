'use strict';
const Web3 = require('web3');
const types = require('./wallet.types');

interface YouStockWallet {
    address: string;
    signTx(tx: any): any;
    isUnlocked(): boolean;
    unlock(password: string): string; //returns error message
}

class KeystoreWallet implements YouStockWallet {
    
    public address: string;

    private _json: any;
    private _unlocked: boolean;

    constructor(json: any) {
        this._json = json;
        this.address = json.address;
    }

    public isUnlocked(): boolean {
        return this._unlocked;
    }

    public unlock(password: string): string {
        return 'not implemented';
    }

    public signTx(tx: any): any {
        return 'not implemented';
    }
}
