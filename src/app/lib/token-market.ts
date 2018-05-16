import * as SortedArray from 'sorted-array';
import { BigNumber } from 'bignumber.js';
import { Order } from './order';
import { NodeService } from '../node.service';

export class Market {

    bid: SortedArray = SortedArray.comparing(x => { return -x.price; }, []);
    ask: SortedArray = SortedArray.comparing(x => { return x.price; }, []);

    bidSum: BigNumber;
    askSum: BigNumber;

    myOrders: Order[];
    orders: any = {};
    
    coinBalance: BigNumber = new BigNumber(0);
    baseBalance: BigNumber = new BigNumber(0);
    coinInOrders: BigNumber = new BigNumber(0);
    baseInOrders: BigNumber = new BigNumber(0);

    //TODO: get this from historical blockchain analyzer
    price: number = 1;
    change: number = 0.1;

    tradeHandle: any;

    mySortProperty: string = 'timestamp';
    mySortDir: boolean = false;

    constructor(public token: string, public node: NodeService) { }

    addBuy(ev: any) {
        this.addOrder(ev, true, null);
    }

    addSell(ev: any) {
        this.addOrder(ev, false, null);
    }

    addOrder(ev: any, buy: boolean, owner: string): void{
        var order = new Order();
        order.buy = buy;
        order.amount = new BigNumber(ev.amount);
        order.id = ev.orderId.toString();
        order.price = new BigNumber(ev.price);

        this.orders[order.id] = order;

        if(buy) {
            this.bid.insert(order);
            this.bidSum = this.calcSum(this.bid.array);
        } else {
            this.ask.insert(order);
            this.askSum = this.calcSum(this.ask.array);
        }

        var that = this;

        if(!owner) {
            this.node.getOwner(order, this.token, (err, owner: string) => {
                if(err)
                    that.node.err(err);
                else {
                    order.owner = owner;
                    that.node.wallet.getAddress((e, a) => {
                        if(e) that.node.err(e);
                        else if (a == owner) that.myOrders.push(order);
                    });
                }
            });
        } else {
            that.node.wallet.getAddress((e, a) => {
                if(e) that.node.err(e);
                else if (a == owner) that.myOrders.push(order);
            });
        }
    }

    getCoinBookBalance(): BigNumber {
        var sum: BigNumber = new BigNumber(0);

        this.myOrders.forEach(o => {
            if(!o.buy) {
                sum = sum.plus(o.amount);
            }
        });

        return sum;
    }

    getBaseBookBalance(): BigNumber {
        var that = this;
        var sum: BigNumber = new BigNumber(0);

        this.myOrders.forEach(o => {
            if(o.buy) {
                sum = sum.plus(o.amount.times(o.price));
            }
        });

        return sum;
    }

    //TODO: retore listings/offers/accepts/initTransactions on load from localStorage
    //TODO: maybe request books from another user
    sortMyOrders() {
        this.sortMyList(this.myOrders, this.mySortProperty, this.mySortDir);
    }

    sortMyList(arr: any[], property: string, direction: boolean) {
        arr.sort((a, b) => {
            var result = 0;
            if(a[property] > b[property])
                result = 1;
            else if (b[property] > a[property])
                result = -1;
            if(direction)
                result = result * -1;
            return result;
        });
    }

    mySort(prop: string) {
        if(prop == this.mySortProperty)
            this.mySortDir = !this.mySortDir;
        else
            this.mySortProperty = prop;
        this.sortMyOrders();
    }
  
    calcSum(entries: Order[]): BigNumber {
        var sum = new BigNumber(0);
        for(var i = 0; i < entries.length; i++) {
            sum = sum.plus(entries[i].price.times(entries[i].amount));
            entries[i].sum = new BigNumber(sum);
        }
        return sum;
    }
}
