[
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
		"outputs": [
			{
				"name": "orderId",
				"type": "uint64"
			}
		],
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
		"outputs": [
			{
				"name": "orderId",
				"type": "uint64"
			}
		],
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
	}
]
