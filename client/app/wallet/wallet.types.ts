var config = require('../../js/config.js');

var WalletTypes = {
    'Aura': {
        unit: 'aura',
        ticker: 'ARA',
        nodeUrl: 'https://pool.auraledger.com',
        chainId: 312,
        youStockContract: '0xF6E5C2b88F25BC129a542A1fe0c022D5dB2b0186'
    },
    'Ethereum': {
        unit: 'ether',
        ticker: 'ETH',
        nodeUrl: 'https://mainnet.infura.io/' + config.infuraApiKey,
        chainId: 1,
    },
    'Ropsten': {
        unit: 'ropsten',
        ticker: 'ROP',
        nodeUrl: 'https://ropsten.infura.io/' + config.infuraApiKey,
        exploreTx: 'https://ropsten.etherscan.io/tx/',
        exploreAddress: 'https://ropsten.etherscan.io/address/',
        chainId: 3,
        youStockContract: ''
    },
    'Rinkeby': {
        unit: 'rinkeby',
        ticker: 'RNK',
        nodeUrl: 'https://rinkeby.infura.io/' + config.infuraApiKey,
        chainId: 4,
    },
}

module.exports = WalletTypes;
