'use strict';
const angular = require('angular');
const Web3 = require('web3');

/*@ngInject*/
export function nodeService(localStorageService, toastr, Util) {
  var nodes = {
    'Aura': {
      unit: 'aura',
      ticker: 'ARA',
      nodeUrl: 'https://pool.auraledger.com'
    },
    'Ropsten': {
      unit: 'rop',
      ticker: 'ROP',
      nodeUrl: 'https://ropsten.infura.io/mew'
    },
  };
  var web3;

  var activeNode;

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
    }
  };

  node.setNode(localStorageService.get("node") || Object.keys(nodes)[0]);

  return node;
}

export default angular.module('betaApp.node', [])
  .service('node', nodeService)
  .name;
