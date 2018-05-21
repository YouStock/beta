import { Injectable } from '@angular/core';
import { TokenMarket } from '../lib/token-market';
import { NodeService } from '../node.service';
import { SettingsService } from '../settings.service';

@Injectable()
export class MarketService {

    private activeToken: string;
    private markets: any = {}; // dict (token -> market)

    constructor(private node: NodeService, private settings: SettingsService) { }

    loadMarket(token: string): TokenMarket {
        var market: TokenMarket;
        if(token == this.activeToken) {
            market = this.markets[token];
        } else if(this.markets.hasOwnProperty(token)) {
            market = this.markets[token]; 
            market.reload();
            this.activeToken = token;
        } else {
            market = new TokenMarket(token, this.node, this.settings);
            this.markets[token] = market;
            this.activeToken = token;
        }
        return market;
    }

    getActiveMarketToken(): string {
        return this.activeToken;
    }
}
