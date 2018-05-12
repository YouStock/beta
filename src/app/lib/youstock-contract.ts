export class YouStockContract {
    static ABI: any[] = [
        {
            "constant": false,
            "inputs": [{
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
            "inputs": [{
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
            "outputs": [{
                "name": "orderId",
                "type": "uint64"
            }],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [{
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
            "inputs": [{
                "name": "",
                "type": "address"
            },
                {
                    "name": "",
                    "type": "uint64"
                }
            ],
            "name": "sells",
            "outputs": [{
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
            "inputs": [{
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
            "outputs": [{
                "name": "orderId",
                "type": "uint64"
            }],
            "payable": false,
            "stateMutability": "nonpayable",
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
            "inputs": [{
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
            "inputs": [{
                "name": "",
                "type": "address"
            },
                {
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "balances",
            "outputs": [{
                "name": "",
                "type": "uint64"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [{
                "name": "",
                "type": "address"
            },
                {
                    "name": "",
                    "type": "uint64"
                }
            ],
            "name": "buys",
            "outputs": [{
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
            "inputs": [{
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
            "inputs": [{
                "name": "",
                "type": "address"
            }],
            "name": "created",
            "outputs": [{
                "name": "",
                "type": "bool"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [{
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
        }
    ];

    static functionHashes = {
        balances: "c23f001f", //: "balances(address,address)",
        buys: "c2407f1f", //: "buys(address,uint64)",
        cancelBuy: "0dda0172", //: "cancelBuy(address,uint64)",
        cancelSell: "d5b9a949", //: "cancelSell(address,uint64)",
        createBuy: "1ce7f3d7", //: "createBuy(address,uint64,uint64)",
        createSell: "6299b64a", //: "createSell(address,uint64,uint64)",
        createToken: "9cbf9e36", //: "createToken()",
        created: "d42efd83", //: "created(address)",
        fillBuy: "bd472146", //: "fillBuy(address,uint64,uint64)",
        fillSell: "c7a4aa2a", //: "fillSell(address,uint64,uint64)",
        sells: "2c8ec4db", //: "sells(address,uint64)",
        transfer: "2a308b3a", //: "transfer(address,address,uint64)"
    };
}
