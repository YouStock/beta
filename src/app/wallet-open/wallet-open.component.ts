import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as CryptoJS from 'crypto-js';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { NodeService } from '../node.service';
import { DataService } from '../data.service';
import { CoreService } from '../core.service';

import { WalletConnector, PrivateKeyConnector } from '../lib/wallet-connector';
import { CoinConfig } from '../lib/coin-config';
import { Utils } from '../lib/utils';

declare var Wallet: any;

@Component({
    selector: 'app-wallet-open',
    templateUrl: './wallet-open.component.html',
    styleUrls: ['./wallet-open.component.scss']
})
export class WalletOpenComponent implements OnInit {
    mode = 'none';

    privKey: string = null; 
    seed: string = null;

    password1 = null;
    password2 = null;
    keypass = null;
    usekeypass = true;
    
    bip39 = (<any>window).bip39js; 

    error = null;
    walletList: any[];

    keystore: File;

    walletName: string = "Wallet 1";

    /*@ngInject*/
    constructor(private toastr: ToastsManager, public node: NodeService, private router: Router, private core: CoreService) {
        var that = this;
        this.walletList = node.walletList;

        var counter = 2;
        while(node.walletNameExists(this.walletName)) {
            this.walletName = "Wallet " + counter;
            counter = counter + 1;
        }

        var balCount = 0;
        this.walletList.forEach(wallet => {
            that.node.getAddressBalance(wallet.address, (err, bal) => {
                if(err) that.node.err(err);
                else wallet.balance = bal;
                balCount++;

                if(balCount == that.walletList.length)
                    that.node.detectChanges();
            });
        });
    }

    fileChanged(evt: any) {
        this.keystore = evt.srcElement.files[0];
        this.node.detectChanges();
    }

    selectWallet(wlt) {
        this.node.selectWallet(wlt);
        this.router.navigate(['/wallet']);
    }

    forgetWallet(wlt, evt) {
        this.node.forgetWallet(wlt);
        evt.preventDefault();
        evt.stopPropagation();
    }

    toggleKeyPass() {
        this.usekeypass = !this.usekeypass;
    }

    import()
    {
        var that=this;
        var fileReader = new FileReader();
        var pw = this.keypass || "";
        if(this.usekeypass)
            this.password1 = this.password2 = pw;
        fileReader.onload = function(evt: any) {
            var wallet: WalletConnector = new PrivateKeyConnector(); 
            var ew;
            var json = JSON.parse(evt.target.result);
            var EthWallet = that.node.getEthWallet();
            if(json.Version && json.Version == 1) {
                try {
                    ew = EthWallet.fromV1(evt.target.result, pw);
                } catch (er) {
                    if(er.message.indexOf('possibly wrong passphrase') > -1)
                    {
                        that.node.err('possibly wrong passphrase');
                    } else {
                        that.node.err(er);
                        that.node.err('Unable to load keystore file');
                    }
                    throw er;
                }
            }
            else if (json.version && json.version == 3) {
                try {
                    ew = EthWallet.fromV3(evt.target.result, pw, true);
                } catch (er){
                    if(er.message.indexOf('possibly wrong passphrase') > -1)
                    {
                        that.node.err('possibly wrong passphrase');
                        console.error(er);
                    } else {
                        that.node.err('Unable to load keystore file');
                        throw er;
                    }
                }
            }
            else
                return that.node.err('Unrecognized keystore format, invalid version');

            that.privKey = ew.getPrivateKeyString();
            that.password1 = that.password2 = pw;

            that.loadPrivKey();
        };
        fileReader.readAsText(this.keystore);
    }

    loadSeed() {
        if(this.password1 != this.password2)
        {
            this.error = 'passwords do not match';
            return;
        }

        var root = this.bip39.calcBip32RootKeyFromSeed(this.seed).toBase58();
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

        this.privKey = data.privkey;
    }

    loadPrivKey() {
        if(this.password1 != this.password2)
        {
            this.error = 'passwords do not match';
            return;
        }

        this.privKey = Utils.zeroX(this.privKey);

        var account = this.node.web3.eth.accounts.privateKeyToAccount(this.privKey);

        var encprivkey = CryptoJS.AES.encrypt(account.privateKey, this.password1).toString();
        var shaprivkey = CryptoJS.SHA256(account.privateKey).toString();

        var wallet: PrivateKeyConnector = new PrivateKeyConnector();
        //TODO: add names to wallets
        wallet.load({
            name: this.walletName,
            address: account.address.substr(2),
            encprivkey: encprivkey,
            shaprivkey: shaprivkey
        }, this.node.web3, this.core);

        this.node.setWallet(wallet);
        this.router.navigate(['/wallet']);
    }

    ngOnInit() {
    }

}
