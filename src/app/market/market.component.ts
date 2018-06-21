import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ParamMap, Router, ActivatedRoute } from '@angular/router';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BigNumber } from 'bignumber.js';

import { DataService, StockInfo } from '../data.service';
import { NodeService } from '../node.service';
import { WEI_MULTIPLIER, TOKEN_MULTIPLIER, PRICE_RATIO } from '../lib/constants';
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

    buyAmountInput: number;
    buyPriceInput: number;
    sellAmountInput: number;
    sellPriceInput: number;

    balance: BigNumber = new BigNumber(0);
    tokenBalance: BigNumber = new BigNumber(0);

    unit: string;

    tokenInput: string;

    constructor(private router: Router, private route: ActivatedRoute, private data: DataService, private node: NodeService, private marketService: MarketService, private toastr: ToastsManager, private settings: SettingsService, private detective: ChangeDetectorRef) { 
        var token = this.route.snapshot.params.token;
        this.unit = node.coin.unit;
        var that = this;
        if(token) {
            that.market = that.marketService.loadMarket(token);
            data.getStockInfo(token, (err, info: StockInfo) => {
                that.stock = info;
                setTimeout(() => that.detective.detectChanges(), 0);
            });

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
}
