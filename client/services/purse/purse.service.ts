'use strict';
const angular = require('angular');
import * as CryptoJS from 'crypto-js';

/*@ngInject*/
export function purseService(Util, localStorageService, node, Modal) {
    var walletAddr;
    var walletHistory;
    var secureWallets;
    var activeWallets;

    walletAddr = localStorageService.get('walletAddr');
    walletHistory = Util.getStoredObject('secureWallets') || {};
    secureWallets = Util.getStoredObject('secureWallets') || {};

    var savedPassword: string;
    
    //TODO: set saved password from password prompt
    function decryptPrivateKey(encprivkey, shaprivkey, pass) {
        var privkey;
        try {
            privkey = CryptoJS.AES.decrypt(encprivkey, pass).toString(CryptoJS.enc.Utf8);
        } catch(error) {
            if(error.message === 'Malformed UTF-8 data')
                throw "Invalid password.";
            throw error;
        }

        if(CryptoJS.SHA256(privkey) != shaprivkey)
            throw "Invalid password.";

        return privkey;
    }

    function _getPrivateKey(pass, cb) {

        var wallet = purse.getWallet();
        if(wallet) {
            switch(wallet.source) {
                case 'privatekey':
                    try {
                        var privkey = decryptPrivateKey(wallet.json.encprivkey, wallet.json.shaprivkey, pass);
                        cb(null, privkey);
                    } catch(error) {
                        console.error(error);
                        cb(error.message);
                    }
                    break;
                default:
                    cb('wallet source ' + wallet.source + ' not yet supported');
                    break;
            }
        } else cb('no wallet loaded');
    }

    var purse = {
        setWallet(wallet) {
            walletAddr = wallet.address;
            walletHistory[wallet.address] = wallet;
            if(wallet.secure)
                secureWallets[wallet.address] = wallet;
            else
                secureWallets[wallet.address] = {
                    address: wallet.address,
                    source: wallet.source
                };
            localStorageService.set('walletAddr', wallet.address);
            Util.storeObject('secureWallets', secureWallets);
        },

        setSavedPassword(pass) {
            savedPassword = pass;
        },

        getWallet() {
            if(walletHistory.hasOwnProperty(walletAddr))
                return walletHistory[walletAddr];
            return null;
        },

        getBalance(cb) {
            var wallet = purse.getWallet();
            if(wallet) {
                node.getBalance(wallet.address, function(res) {
                    cb(res);
                });
            }
        },

        getPrivateKey(cb) {
            var wallet = purse.getWallet();
            if(wallet) {
                if(savedPassword) {
                    _getPrivateKey(savedPassword, (err, key) => {
                        if(err)
                            prompPrivateKey(cb);
                        else
                            cb(null, key);
                    });
                } else {
                    prompPrivateKey(cb);
                }
            } else {
                cb('no wallet loaded');
            }
        },

        promptPassword(cb) {
            Modal.password((pass, unlock) => {
                if(unlock)
                    savedPassword = pass;
                cb(null, pass);
            });
        },

        getEthBalance(cb) {
            this.getBalance((bal) => {
                cb(node.getWeb3().utils.fromWei(bal, 'ether'));
            });
        },

        getContractOwnerAddress() {
            //TODO: for hosted wallets, get the shared hot wallet address
            var wallet = purse.getWallet();
            return wallet.address;
        },

        getDepositAddress() {
            //TODO: for hosted wallets, get the user hot wallet address
            var wallet = purse.getWallet();
            return wallet.address;
        },

        getWeb3() {
            return node.getWeb3();
        },

        getUnit() {
            return node.getUnit();
        }
    };

    function prompPrivateKey(cb) {
        purse.promptPassword((err, pass) => {
            if(err)
                cb(err) 
            else
                _getPrivateKey(pass, cb);
        });
    }

    return purse;
}

export default angular.module('betaApp.purse', [])
    .service('purse', purseService)
    .name;
