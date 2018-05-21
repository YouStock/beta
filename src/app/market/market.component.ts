import { Component, OnInit } from '@angular/core';
import { ParamMap, Router, ActivatedRoute } from '@angular/router';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { DataService, StockInfo } from '../data.service';
import { NodeService } from '../node.service';
import { MarketService } from './market.service';

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

    constructor(private router: Router, private route: ActivatedRoute, private data: DataService, private node: NodeService, private marketService: MarketService) { 
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
    }

    sell() {
        var that = this;

        var matchRes = this.market.getBuyListinsForSell(this.sellAmount, this.buyPrice);

        this.node.buildFillBuyTransaction(this.market.token, (err, tx) => {
            if(err) return that.node.err(err);
            that.node.wallet.signTx(tx, (err, signedTx) => {
                if(err) return that.node.err(err);
                var prevMode = that.mode;
                that.mode = 'loading';
                that.node.sendSignedTransaction(signedTx, (err, txHash) => {
                    if(err) { 
                        that.mode = prevMode;
                        return that.node.err(err);
                    }
                    that.creationInfo.stockTx = txHash;
                    that.creationInfo.stockExpire = new Date().getTime() + 1000 * 60 * 60 * 24 * 2; //two days
                    that.saveCreationInfo();
                    that.setMode();
                    this.uploadImage((link) => {
                        that.img = link;
                        //TODO: update all at once
                        that.data.setImg(link);
                        that.data.setFullName(that.fullName);
                        that.data.setTicker(that.symb);
                        that.data.setBio(that.newbio || that.bio);
                    });
                });
            });
        });

    }

    cancel() {

    }
}
