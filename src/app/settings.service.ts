import { Injectable } from '@angular/core';
import { CoinConfig } from './lib/coin-config';
import { ElectronService } from 'ngx-electron';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { BigNumber } from 'bignumber.js';
import { WEI_MULTIPLIER } from './lib/constants';

declare var require: any;

@Injectable()
export class SettingsService {

    web3ProviderUrl: string;

    private subscriptions: { (): void }[] = [];

    private test: boolean = true;

    coin: CoinConfig;

    gasGwei: BigNumber = new BigNumber('1');

    minOrderSize: BigNumber = WEI_MULTIPLIER.times('0.005');

    dataServiceUrl: string = 'http://localhost:8997';

    //TODO: start a process to get and update recommended gas price periodically
    autoGasGwei: boolean = true;

    constructor(private toastr: ToastsManager, private electron: ElectronService) { 

        this.test = electron.remote.getGlobal('__YouStockTesting');

        if(this.test)
            this.coin = this.coins[4];
        else
            this.coin = this.coins[0];
        this.load();
    }

    isTest(): boolean {
        return this.test;
    }

    storageKey(key: string): string {
        if(this.isTest())
            return key + 'test';
        return key;
    }

    load() {
        var rawSettingsJson = JSON.parse(localStorage.getItem(this.storageKey('settings'))) || {};
        this.web3ProviderUrl = this.getStoredCoinProp(rawSettingsJson, 'web3ProviderUrl', this.coin.node.wssUrl);
        this.gasGwei = new BigNumber(this.getStoredCoinProp(rawSettingsJson, 'gasGwei', '1'));
        this.autoGasGwei = Boolean(this.getStoredCoinProp(rawSettingsJson, 'autoGasGwei', 'true'));
    }

    private getStoredCoinProp(rawSettingsJson: any, prop: string, dflt: string) {
        if(rawSettingsJson.hasOwnProperty(prop) && rawSettingsJson[prop].hasOwnProperty(this.coin.name))
            return rawSettingsJson[prop][this.coin.name];
        else
            return dflt;
    }

    save() {
        var sets: any = {};
        sets['web3ProviderUrl'] = {};
        sets['web3ProviderUrl'][this.coin.name] = this.web3ProviderUrl;
        sets['gasGwei'] = {};
        sets['gasGwei'][this.coin.name] = this.gasGwei;
        sets['autoGasGwei'] = {};
        sets['autoGasGwei'][this.coin.name] = this.autoGasGwei;
        localStorage.setItem(this.storageKey('settings'), JSON.stringify(sets));
    }

    err(err) {
        console.log(err);
        this.toastr.error(err); 
    }

    warn(msg) {
        this.toastr.warning(msg);
    }

    onChange() {
        this.save();
        this.subscriptions.forEach(f => f());
    }

    subscribe(f: () => void): void {
        this.subscriptions.push(f);
    }

    coins: CoinConfig[] = [
        {
            name: 'Aura',
            test: false,
            unit: 'aura',
            ticker: 'ARA',
            hdPath: 312,
            node: {
                type: 'Ether',
                chainId: 312,
                wssUrl: 'wss://pool.auraledger.com',
                contractAddress: '',
                requiredConfirmations: 12, 
            },
            website: 'https://auraledger.com',
            ANN: 'https://bitcointalk.org/index.php?topic=2818598',
            twitter: '',
            facebook: '',
            reddit: '',
            telegram: '',
            discord: '',
            slack: ''
        },
        {
            name: 'Ethereum',
            test: false,
            unit: 'ether',
            ticker: 'ETH',
            hdPath: 60,
            node: {
                type: 'Ether',
                chainId: 1,
                wssUrl: 'wss://mainnet.infura.io/ws',
                contractAddress: '',
                requiredConfirmations: 12, 
            },
            website: 'https://ethereum.org',
            ANN: '',
            twitter: '',
            facebook: '',
            reddit: '',
            telegram: '',
            discord: '',
            slack: ''
        },
        {
            name: 'Ropsten',
            test: true,
            unit: 'rop',
            ticker: 'ROP',
            hdPath: 2837466,
            node: {
                type: 'Ether',
                chainId: 3,
                wssUrl: 'wss://ropsten-ws.youstock.io',
                //wssUrl: 'ws://127.0.0.1:8545',
                contractAddress: '0xE001feEC5B15F31B8289e024eEE3b2651a04fBf1',
                requiredConfirmations: 1,             
            },
            website: 'https://ethereum.org',
            ANN: '', 
            twitter: '',
            facebook: '',
            reddit: '',
            telegram: '',
            discord: '', 
            slack: ''
        },
        {
            name: 'Rinkeby',
            test: true,
            unit: 'rnk',
            ticker: 'RNK',
            hdPath: 2837467,
            node: {
                type: 'Ether',
                chainId: 4,
                wssUrl: 'wss://rinkeby.infura.io/ws',
                contractAddress: '0xE001feEC5B15F31B8289e024eEE3b2651a04fBf1',
                requiredConfirmations: 1,             
            },
            website: 'https://ethereum.org',
            ANN: '', 
            twitter: '',
            facebook: '',
            reddit: '',
            telegram: '',
            discord: '', 
            slack: ''
        },
        {
            name: 'AuraTest',
            test: true,
            unit: 'art',
            ticker: 'ART',
            hdPath: 2837469,
            node: {
                type: 'Ether',
                chainId: 777,
                wssUrl: 'wss://ropsten-ws.youstock.io',
                contractAddress: '0x219b20138bf8219518c4e82afdc19781b617b97d',
                requiredConfirmations: 1,             
            },
            website: 'https://auraledger.com',
            ANN: '', 
            twitter: '',
            facebook: '',
            reddit: '',
            telegram: '',
            discord: '', 
            slack: ''


        }
    ];
}
