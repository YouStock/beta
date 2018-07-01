import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ParamMap, Router, ActivatedRoute } from '@angular/router';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BigNumber } from 'bignumber.js';
import * as Highcharts from 'highcharts/highstock';
import { ChartModule } from 'angular2-highcharts'; 

import { DataService, StockInfo } from '../data.service';
import { NodeService } from '../node.service';
import { WEI_MULTIPLIER, TOKEN_MULTIPLIER, PRICE_RATIO } from '../lib/constants';
import { MarketService } from './market.service';
import { SettingsService } from '../settings.service';

import { getTestData } from './test-data';

import { TokenMarket } from '../lib/token-market';

@Component({
    selector: 'app-market',
    templateUrl: './market.component.html',
    styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit {

    market: TokenMarket;

    buyAmountInput: number;
    buyPriceInput: number;
    sellAmountInput: number;
    sellPriceInput: number;

    balance: BigNumber = new BigNumber(0);
    tokenBalance: BigNumber = new BigNumber(0);

    unit: string;

    tokenInput: string;

    //chart
    chart;
    ohlc;
    volume;
    dataLength;
    groupingUnits;
    options;

    constructor(private router: Router, private route: ActivatedRoute, private data: DataService, private node: NodeService, private marketService: MarketService, private toastr: ToastsManager, private settings: SettingsService, private detective: ChangeDetectorRef) { 
        var token = this.route.snapshot.params.token;
        this.unit = node.coin.unit;
        var that = this;
        if(token) {
            that.market = that.marketService.loadMarket(token);

            node.getTokenBalance(token, (e, b) => {
                if(e) return node.err(e);
                that.tokenBalance = new BigNumber(b.toString());
                that.detective.detectChanges();
            });

            node.getBalance((e, b) => {
                if(e) return node.err(e);
                that.balance = new BigNumber(b.toString());
                that.detective.detectChanges();
            });

            this.setTheme();
            this.market.onDataLoad = () => that.setupMarketData();

        } else {
            var lastMarket = marketService.getActiveMarketToken();
            if(lastMarket)
                router.navigate(['market', lastMarket]);
            else {
                if(node.wallet) {
                    node.wallet.getAddress((err, ad) => {
                        router.navigate(['market', ad]);
                    });
                }
            }
        }
    }

    goToMarket() {
        this.router.navigate(['market', this.tokenInput]); //TODO: validate tokenInput
    }

    buy() {
        var that = this;

        if(this.buyPriceInput <= 0)
            return;

        if(this.buyAmountInput <= 0)
            return;

        var buyPrice = PRICE_RATIO.times(this.buyPriceInput.toString());
        var buyAmount = TOKEN_MULTIPLIER.times(this.buyAmountInput.toString());


        if(this.settings.minOrderSize.isGreaterThan(buyPrice.times(buyAmount)))
            return;

        var matchRes = this.market.getSellListingsForBuy(buyAmount, buyPrice);

        this.node.buildBatchBuyTransaction(this.market.token, buyAmount, buyPrice, matchRes, (err, tx) => {
            if(err) return that.node.err(err);
            that.node.wallet.signTx(tx, (err, signedTx) => {
                if(err) return that.node.err(err);
                that.toastr.info('Sending trade to the blockchain');
                that.node.sendSignedTransaction(signedTx, (err, txHash) => {
                    if(err) return that.node.err(err);
                    that.toastr.success('Trade sent to blockchain, waiting to be mined');
                });
            });
        });
    }

    sell() {
        var that = this;

        if(this.sellPriceInput <= 0)
            return;

        if(this.sellAmountInput <= 0)
            return;

        var sellPrice = PRICE_RATIO.times(this.sellPriceInput.toString());
        var sellAmount = TOKEN_MULTIPLIER.times(this.sellAmountInput.toString());

        if(this.settings.minOrderSize.isGreaterThan(sellPrice.times(sellAmount)))
            return;

        var matchRes = this.market.getBuyListingsForSell(sellAmount, sellPrice);

        this.node.buildBatchSellTransaction(this.market.token, sellAmount, sellPrice, matchRes, (err, tx) => {
            if(err) return that.node.err(err);
            that.node.wallet.signTx(tx, (err, signedTx) => {
                if(err) return that.node.err(err);
                that.toastr.info('Sending trade to the blockchain');
                that.node.sendSignedTransaction(signedTx, (err, txHash) => {
                    if(err) return that.node.err(err);
                    that.toastr.success('Trade sent to blockchain, waiting to be mined');
                });
            });
        });
    }

    cancel(id: string) {

    }

    chartLoaded(chartInstance): void {
        this.chart = chartInstance;
    }

    setupMarketData() {
        var data  = this.market.marketHours;

        // split the data set into ohlc and volume
        this.ohlc = [];
        this.volume = [];
        this.dataLength = data.length;
        // set the allowed units for data grouping
        this.groupingUnits = [[
            'hour',                         // unit name
            [1, 6]                          // allowed multiples
        ], [
            'day',                          // unit name
            [1]                             // allowed multiples
        ], [
            'week',                         // unit name
            [1]                             // allowed multiples
        ], [
            'month',
            [1, 4]
        ]];

        for (var i = 0; i < this.dataLength; i += 1) {
            this.ohlc.push([
                data[i][0], // the date
                data[i][3], // open
                data[i][1], // high
                data[i][2], // low
                data[i][4]// close
            ]);

            this.volume.push([
                data[i][0], // the date
                data[i][5] // the volume
            ]);
        }

        this.chart.series[0].setData(this.ohlc);
        this.chart.series[1].setData(this.volume);

        this.node.detectChanges();
    }

    ngOnInit() {
        
        this.options = {

            rangeSelector: {
                selected: 1
            },

            title: {
                text: ''
            },

            width: '100%',
            height: '500px',

            yAxis: [{
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Price (ETH)'
                },
                height: '60%',
                lineWidth: 2,
                resize: {
                    enabled: true
                }
            }, {
                labels: {
                    align: 'right',
                    x: -3
                },
                title: {
                    text: 'Volume'
                },
                top: '65%',
                height: '35%',
                offset: 0,
                lineWidth: 2
            }],

            tooltip: {
                split: true
            },

            series: [{
                type: 'candlestick',
                name: 'Aura',
                data: this.ohlc,
                dataGrouping: {
                    units: this.groupingUnits
                }
            }, {
                type: 'column',
                name: 'Volume',
                data: this.volume,
                yAxis: 1,
                dataGrouping: {
                    units: this.groupingUnits
                }
            }]
        };
    }


    setTheme() {
        var theme: any = {
            colors: ['#7cb5ec', '#f7a35c', '#90ee7e', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
            chart: {
                backgroundColor: 'white',
                style: {
                    fontFamily: 'Dosis, sans-serif'
                }
            },
            title: {
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                }
            },
            tooltip: {
                borderWidth: 0,
                backgroundColor: 'rgba(219,219,216,0.8)',
                shadow: false
            },
            legend: {
                itemStyle: {
                    fontWeight: 'bold',
                    fontSize: '13px'
                }
            },
            xAxis: {
                gridLineWidth: 1,
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            yAxis: {
                minorTickInterval: 'auto',
                title: {
                    style: {
                        textTransform: 'uppercase'
                    }
                },
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            plotOptions: {
                candlestick: {
                    lineColor: '#404048'
                }
            },


            // General
            background2: '#F0F0EA'

        };

        // Apply the theme
        Highcharts.setOptions(theme);
    }

}
