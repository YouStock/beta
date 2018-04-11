var config = require('../../config.js');

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
      unit: 'rop',
      ticker: 'ROP',
      nodeUrl: 'https://ropsten.infura.io/' + config.infuraApiKey,
    },
    'Rinkeby': {
      unit: 'rink',
      ticker: 'RNK',
      nodeUrl: 'https://rinkeby.infura.io/' + config.infuraApiKey,
    },
}
