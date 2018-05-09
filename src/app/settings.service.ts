import { Injectable } from '@angular/core';
import { CoinConfig } from './lib/coin-config';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class SettingsService {

    web3ProviderUrl: string;

    private subscriptions: { (): void }[] = [];

    private test: boolean = true;

    coin: CoinConfig;

    constructor(private toastr: ToastsManager) { 
        if(this.test)
            this.coin = this.coins[2];
        else
            this.coin = this.coins[0];
        this.load();
    }

    load() {
        var sets = JSON.parse(localStorage.getItem('settings')) || {};
        if(sets.hasOwnProperty('web3ProviderUrl') && sets['web3ProviderUrl'].hasOwnProperty(this.coin.name))
            this.web3ProviderUrl = sets['web3ProviderUrl'][this.coin.name];
        else
            this.web3ProviderUrl = this.coin.node.rpcUrl;
    }

    save() {
        var sets: any = {};
        sets['web3ProviderUrl'] = {};
        sets['web3ProviderUrl'][this.coin.name] = this.web3ProviderUrl;
        localStorage.setItem('settings', JSON.stringify(sets));
    }

    err(err) {
        console.log(err);
        this.toastr.error(err); 
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
                rpcUrl: 'https://pool.auraledger.com',
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
                rpcUrl: 'https://mainnet.infura.io/CQE6ZkyB1BOEZx4cOkAl',
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
                rpcUrl: 'https://ropsten.infura.io/CQE6ZkyB1BOEZx4cOkAl',
                contractAddress: '0x01c4d9Cd5D053E4d838092eFAa0877F6828114E8',
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
        }
    ];
}
