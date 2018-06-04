import { BigNumber } from 'bignumber.js';

export class Order {
    buy: boolean;
    id: string;
    finished: boolean;

    origAmount: BigNumber;
    price: BigNumber;
    owner: string;
    sum: BigNumber;
    fills: Fill[] = [];
    
    amount: BigNumber;
    size: BigNumber;

    serialize(): string {
        return JSON.stringify( {
            id: this.id,
            buy: this.buy,
            finished: this.finished,
            origAmount: this.origAmount.toString(10),
            price: this.price.toString(10),
            owner: this.owner,
            fills: this.flattenFills()
        });
    }

    static deserialize(data: string): Order {
        if(!data || data.trim() == '')
            return null;

        var rawData = JSON.parse(data) || {};
        var result = new Order();

        result.id = rawData.id;
        result.buy = rawData.buy;
        result.finished = rawData.finished;
        result.origAmount = new BigNumber(rawData.origAmount);
        result.price = new BigNumber(rawData.price);
        result.owner = rawData.owner;
        result.sum = new BigNumber(0); 

        result.refill();
        result.estimateAmount();

        return result;
    }

    private flattenFills(): string {
        var strFills = []
        this.fills.forEach(f => strFills.push(f.stringy()));
        return JSON.stringify(strFills);
    }

    private refill(): void {
        for(var i = 0; i < this.fills.length; i++) {
            this.fills[i] = Fill.unString(this.fills[i]);
        }
    }

    addFill(ev: any) {
        var fill = new Fill();
        fill.blockNumber = new BigNumber(ev.blockNumber);
        fill.amount = new BigNumber(ev.returnValues.amount);
        this.fills.push(fill);

        this.estimateAmount();

        //TODO: add to trade history data
    }

    estimateAmount() {
        if(this.finished) {
            this.amount = new BigNumber(0);
            return;
        }
        var filled = new BigNumber(0);
        this.fills.forEach(f => filled = filled.plus(f.amount));
        var remain = this.origAmount.minus(filled);
        this.amount = remain;

        this.size = this.amount.times(this.price);
    }

    save(): void {
        localStorage.setItem('order-' + this.id, this.serialize()); 
    }

    delete(): void {
        localStorage.delete('order-' + this.id);
    }

    static load(id: string): Order {
        return Order.deserialize(localStorage.getItem('order-' + id));
    }
}

export class Fill {
    blockNumber: BigNumber;
    amount: BigNumber;

    stringy(): any {
        return { blockNumber: this.blockNumber.toString(10), amount: this.amount.toString(10) };
    }

    static unString(data: any): Fill {
        var res = new Fill();
        res.blockNumber = new BigNumber(data.blockNumber);
        res.amount = new BigNumber(data.amount);
        return res;
    }
}
