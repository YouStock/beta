export class MarketData {
    orderIds: string[];

    buys: MarketOrder[];
    sells: MarketOrder[];
    
    serialize(): string {
        return JSON.stringify(this.orderIds);
    };

    static deserialize(data: string): MarketData {
        var md = new MarketData();
        md.orderIds = JSON.parse(data);
        return md;
    };

    onBuy(ev) {

    }

    onSell(ev) {

    }

    onUpdate(ev) {

    }
}
