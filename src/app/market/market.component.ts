import { Component, OnInit } from '@angular/core';
import { ParamMap, Router, ActivatedRoute } from '@angular/router';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BigNumber } from 'bignumber.js';

import { DataService, StockInfo } from '../data.service';
import { NodeService } from '../node.service';
import { MarketService } from './market.service';
import { SettingsService } from '../settings.service';

import { TokenMarket } from '../lib/token-market';

@Component({
    selector: 'app-market',
    templateUrl: './market.component.html',
    styleUrls: ['./market.component.scss']
})
export class MarketComponent {

    stock: StockInfo = <any>{}; //TODO: get stock info from data service
    market: TokenMarket;

    buyAmount: number;
    buyPrice: number;
    sellAmount: number;
    sellPrice: number;

    constructor(private router: Router, private route: ActivatedRoute, private data: DataService, private node: NodeService, private marketService: MarketService, private toastr: ToastsManager, private settings: SettingsService ) { 
        var token = this.route.snapshot.params.token;
        var that = this;
        if(token) {
            that.market = that.marketService.loadMarket(token);
            data.getStockInfo(token, (err, info: StockInfo) => {
                that.stock = info;
            });
        } else {
            var lastMarket = marketService.getActiveMarketToken();
            if(lastMarket)
                router.navigate(['market', lastMarket]);
            else {
                node.wallet.getAddress((err, ad) => {
                    router.navigate(['market', ad]);
                });
            }
        }
    }

    buy() {
        var that = this;

        if(this.buyPrice <= 0)
            return;

        if(this.buyAmount <= 0)
            return;

        if(this.settings.minOrderSize.isGreaterThan((new BigNumber(this.buyPrice.toString())).times(this.buyAmount.toString())))
            return;

        var matchRes = this.market.getSellListingsForBuy(this.buyAmount, this.buyPrice);

        this.node.buildBatchBuyTransaction(this.market.token, new BigNumber(this.buyAmount), new BigNumber(this.buyPrice), matchRes, (err, tx) => {
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

        if(this.sellPrice <= 0)
            return;

        if(this.sellAmount <= 0)
            return;

        if(this.settings.minOrderSize.isGreaterThan((new BigNumber(this.sellPrice.toString())).times(this.sellAmount.toString())))
            return;

        var matchRes = this.market.getBuyListingsForSell(this.sellAmount, this.sellPrice);

        this.node.buildBatchSellTransaction(this.market.token, new BigNumber(this.sellAmount), new BigNumber(this.sellPrice), matchRes, (err, tx) => {
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
}
