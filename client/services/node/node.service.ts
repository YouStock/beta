'use strict';
const angular = require('angular');
const Web3 = require('web3');
const contractData = require('../../../contract/abi.js');
const WalletTypes = require('../../app/wallet/wallet.types');

/*@ngInject*/
export function nodeService(localStorageService, toastr, Util) {
    var nodes = WalletTypes;
    var web3;

    var activeNode; 
    var gasGwei = localStorageService.get("gasGwei") || 2;

    var node = {
        getNode: function() {
            return nodes[activeNode];
        },
        setNode: function(name) {
            if(nodes.hasOwnProperty(name)) {
                localStorageService.set("node", name);
                activeNode = name;
                node.connect(null);
            }
            else
                toastr.error(name, "Unknown node");
        },
        setGas: function(gas) { //todo, allow user to set this for every transaction
            gasGwei = gas;
            localStorageService.set('gasGwei', gas);
        },
        addNode: function(name, n) {
            nodes[name] = n;
            activeNode = name;
        },
        getNodes: function() {
            return nodes;
        },
        connect: function(callback) {
            web3 = new Web3(new Web3.providers.HttpProvider(node.getNode().nodeUrl)); 
            toastr.success(activeNode + ' newtork.', 'Connected!') 
        },
        getBalance: function(address, callback) {
            web3.eth.getBalance(address, undefined, function(err, res) {
                if(err)
                {
                    console.log(err);
                    toastr.error(err, 'Error getting balance');
                } else
                    callback(res);
            });
        },
        getWeb3: function() {
            return web3;
        },
        getUnit: function() {
            return this.getNode().unit;
        },
        createStock: function(name: string, symb: string, decimals: number, total: number, address: string, privkey: string, handler: (err: any, txHash: string) => void) {
            var youstocktokenContract = new web3.eth.Contract(contractData.abi);
            var deploy = youstocktokenContract.deploy({
                data: contractData.byteCode,
                arguments: [ symb, name, total, decimals]
            });

            var walletNode = node.getNode();


            deploy.estimateGas({from: address, gas: '4700000'}, function(err, gas) {
                if(err)
                    handler(err, null);
                else {
                    web3.eth.accounts.signTransaction( {
                        from: address,
                        gas: (Number(gas)*1.2).toFixed(0),
                        gasPrice: web3.utils.toWei(gasGwei.toString(10), 'gwei'),
                        chainId: walletNode.chainId, 
                        data: deploy.encodeABI()
                    }, privkey, function (err, signedTx) {
                        if(err)
                            handler(err, null);
                        else {
                            web3.eth.sendSignedTransaction(signedTx.rawTransaction, handler);
                        }
                    });
                }
            });
        },
    };

    node.setNode('Ropsten'); //TODO: change to Aura for main release

    return node;
}

export default angular.module('betaApp.node', [])
    .service('node', nodeService)
    .name;
