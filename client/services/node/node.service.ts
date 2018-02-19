'use strict';
const angular = require('angular');
const web3 = require('web3');

/*@ngInject*/
export function nodeService(localStorageService, toastr) {
  var nodes = {
    'Ropsten': {
      unit: 'rop',
      ticker: 'ROP',
      nodeUrl: 'https://ropsten.infura.io/mew'
    }
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
    }
  };

  node.setNode(localStorageService.get("node") || Object.keys(nodes)[0]);

  return node;
}

export default angular.module('betaApp.node', [])
  .service('node', nodeService)
  .name;
