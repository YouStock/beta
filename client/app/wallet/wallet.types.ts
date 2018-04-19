var config = require('../../js/config.js');

var WalletTypes = {
    'Aura': {
      unit: 'aura',
      ticker: 'ARA',
      nodeUrl: 'https://pool.auraledger.com'
    },
    'Ethereum': {
      unit: 'ether',
      ticker: 'ETH',
      nodeUrl: 'https://mainnet.infura.io/' + config.infuraApiKey,
    },
    'Ropsten': {
      unit: 'ropsten',
      ticker: 'ROP',
      nodeUrl: 'https://ropsten.infura.io/' + config.infuraApiKey,
    },
    'Rinkeby': {
      unit: 'rinkeby',
      ticker: 'RNK',
      nodeUrl: 'https://rinkeby.infura.io/' + config.infuraApiKey,
    },
}

module.exports = WalletTypes;
