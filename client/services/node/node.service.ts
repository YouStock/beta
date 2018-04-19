'use strict';
const angular = require('angular');
const Web3 = require('web3');
const contractData = require('../../../contract/abi.js');
const WalletTypes = require('../../app/wallet/wallet.types');

/*@ngInject*/
export function nodeService(localStorageService, toastr, Util) {
    var nodes = WalletTypes;
    var web3;

    var activeNode = 'Ropsten'; //TODO: change to Aura for main release

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
        addNode: function(name, n) {
            nodes[name] = n;
            activeNode = name;
        },
        getNodes: function() {
            return nodes;
        },
        connect: function(callback) {
            web3 = new Web3(new Web3.providers.HttpProvider(node.getNode().nodeUrl)); 
            if(web3.isConnected())
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
        createStock: function(name: string, symb: string, decimals: number, total: number, address: string, handler: (err: any, contract: any) => void) {
            var youstocktokenContract = web3.eth.contract(contractData.abi);
            var youstocktoken = youstocktokenContract.new(
                symb,
                name,
                total,
                decimals,
                {
                    from: address, 
                    data: contractData.byteCode,
                    gas: '4700000'
                }, handler);
        }};

    return node;
}

export default angular.module('betaApp.node', [])
    .service('node', nodeService)
    .name;
