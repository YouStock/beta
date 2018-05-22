export class YouStockContract {
    static ABI: any[] = [
        {
            "constant": false,
            "inputs": [
                {
                    "name": "token",
                    "type": "address"
                },
                {
                    "name": "orderId",
                    "type": "uint64"
                }
            ],
            "name": "cancelBuy",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "token",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint64"
                },
                {
                    "name": "price",
                    "type": "uint64"
                }
            ],
            "name": "createBuy",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "token",
                    "type": "address"
                },
                {
                    "name": "orderId",
                    "type": "uint64"
                }
            ],
            "name": "sellOwner",
            "outputs": [
                {
                    "name": "owner",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "token",
                    "type": "address"
                },
                {
                    "name": "to",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint64"
                }
            ],
            "name": "transfer",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "address"
                },
                {
                    "name": "",
                    "type": "uint64"
                }
            ],
            "name": "sells",
            "outputs": [
                {
                    "name": "owner",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint64"
                },
                {
                    "name": "price",
                    "type": "uint64"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "token",
                    "type": "address"
                },
                {
                    "name": "orderId",
                    "type": "uint64"
                }
            ],
            "name": "buyOwner",
            "outputs": [
                {
                    "name": "owner",
                    "type": "address"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "token",
                    "type": "address"
                },
                {
                    "name": "price",
                    "type": "uint64"
                },
                {
                    "name": "orderIds",
                    "type": "uint64[]"
                }
            ],
            "name": "batchBuy",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "token",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint64"
                },
                {
                    "name": "price",
                    "type": "uint64"
                }
            ],
            "name": "createSell",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "token",
                    "type": "address"
                },
                {
                    "name": "orderIds",
                    "type": "uint64[]"
                }
            ],
            "name": "batchBuyInfo",
            "outputs": [
                {
                    "name": "amounts",
                    "type": "uint64[]"
                },
                {
                    "name": "prices",
                    "type": "uint64[]"
                },
                {
                    "name": "owners",
                    "type": "address[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [],
            "name": "createToken",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "token",
                    "type": "address"
                },
                {
                    "name": "_amount",
                    "type": "uint64"
                },
                {
                    "name": "price",
                    "type": "uint64"
                },
                {
                    "name": "orderIds",
                    "type": "uint64[]"
                }
            ],
            "name": "batchSell",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "token",
                    "type": "address"
                },
                {
                    "name": "orderId",
                    "type": "uint64"
                },
                {
                    "name": "_amount",
                    "type": "uint64"
                }
            ],
            "name": "fillBuy",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "address"
                },
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "balances",
            "outputs": [
                {
                    "name": "",
                    "type": "uint64"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "address"
                },
                {
                    "name": "",
                    "type": "uint64"
                }
            ],
            "name": "buys",
            "outputs": [
                {
                    "name": "owner",
                    "type": "address"
                },
                {
                    "name": "amount",
                    "type": "uint64"
                },
                {
                    "name": "price",
                    "type": "uint64"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "token",
                    "type": "address"
                },
                {
                    "name": "orderId",
                    "type": "uint64"
                },
                {
                    "name": "_amount",
                    "type": "uint64"
                }
            ],
            "name": "fillSell",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "created",
            "outputs": [
                {
                    "name": "",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "token",
                    "type": "address"
                },
                {
                    "name": "orderId",
                    "type": "uint64"
                }
            ],
            "name": "cancelSell",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "token",
                    "type": "address"
                },
                {
                    "name": "orderIds",
                    "type": "uint64[]"
                }
            ],
            "name": "batchSellInfo",
            "outputs": [
                {
                    "name": "amounts",
                    "type": "uint64[]"
                },
                {
                    "name": "prices",
                    "type": "uint64[]"
                },
                {
                    "name": "owners",
                    "type": "address[]"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "token",
                    "type": "address"
                }
            ],
            "name": "CreatedToken",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "token",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "orderId",
                    "type": "uint64"
                },
                {
                    "indexed": false,
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "amount",
                    "type": "uint64"
                },
                {
                    "indexed": false,
                    "name": "price",
                    "type": "uint64"
                }
            ],
            "name": "CreatedBuy",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "token",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "orderId",
                    "type": "uint64"
                },
                {
                    "indexed": false,
                    "name": "owner",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "amount",
                    "type": "uint64"
                },
                {
                    "indexed": false,
                    "name": "price",
                    "type": "uint64"
                }
            ],
            "name": "CreatedSell",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "token",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "orderId",
                    "type": "uint64"
                },
                {
                    "indexed": false,
                    "name": "amount",
                    "type": "uint64"
                }
            ],
            "name": "FilledBuy",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "token",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "orderId",
                    "type": "uint64"
                },
                {
                    "indexed": false,
                    "name": "amount",
                    "type": "uint64"
                }
            ],
            "name": "FilledSell",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "token",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "orderId",
                    "type": "uint64"
                }
            ],
            "name": "CancelledOrder",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "name": "token",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "from",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "name": "to",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "name": "amount",
                    "type": "uint64"
                }
            ],
            "name": "Transfered",
            "type": "event"
        }
    ];

}
