import * as SortedArray from 'sorted-array';
import { BigNumber } from 'bignumber.js';
import { Order } from './order';
import { NodeService } from '../node.service';

export class TokenMarket {
    bid: SortedArray = SortedArray.comparing(x => { return -x.price; }, []);
    ask: SortedArray = SortedArray.comparing(x => { return x.price; }, []);

    bidSum: BigNumber;
    askSum: BigNumber;

    orders: any = {};
    orderIds: string[];
    myOrders: Order[];

    walletAddress: string;

    coinBalance: BigNumber = new BigNumber(0);
    baseBalance: BigNumber = new BigNumber(0);
    coinInOrders: BigNumber = new BigNumber(0);
    baseInOrders: BigNumber = new BigNumber(0);

    //track high and low for event filters
    blockLow: BigNumber;
    blockHigh: BigNumber;
    blockCreated: BigNumber;

    //TODO: get this from latest fill, or moving average? 
    price: number = 1;
    change: number = 0.1;

    mySortProperty: string = 'timestamp';
    mySortDir: boolean = false;

    mode: string = 'syncing';

    constructor(public token: string, public node: NodeService) { 
        this.orderIds = JSON.parse(localStorage.getItem(token + '-orderIds')) || [];
        var that = this;
        node.wallet.getAddress((e, walletAddress) => {
            that.walletAddress = walletAddress;
            var staleIds = [];
            for(var i = that.orderIds.length - 1; i < that.orderIds.length; i++)
            {
                var ord = Order.load(that.orderIds[i]);
                if(ord) {
                    that.orders[that.orderIds[i]] = ord
                    if(ord.estAmount.isGreaterThanOrEqualTo(ord.minThresh())) {
                        if(ord.buy)
                            that.bid.insert(ord);
                        else
                            that.ask.insert(ord);
                        if(ord.owner == walletAddress)
                            that.myOrders.push(ord);
                    }
                }
                else
                    staleIds.push(that.orderIds[i]);
            }
            //TODO: get order info for any found stale ids (should never have any... but just in case)
            //
            //start getting orders
            that.blockCreated = new BigNumber(localStorage.getItem(token + '-blockCreated'));
            if(!that.blockCreated || that.blockCreated.isEqualTo(0)) {
                node.getBlockCreated(token, (e, bc) => {
                    if(bc.isLessThanOrEqualTo(0)) return node.err('invalid block created ' + bc.toString(10) + ' for token ' + token);
                    that.blockCreated = bc;
                    localStorage.setItem(token + '-blockCreated', bc.toString(10));
                    that.startGettingPastOrders();
                });
            } else {
                that.startGettingPastOrders();
            }
        });
    }

    unload() { }

    reload() {
        var that = this;
        this.mode = 'syncing';
        this.node.getBlockNumber((e, bn) => {
            this.node.subscribe(that.token, bn.plus(1), (err, evnt) => {
                that.saveBlockNumber(evnt);
                that.processEvent(evnt);
            });
            that.startGettingRecentOrders(bn);
        });
    }

    private addOrderId(id) {
        if(!this.orders.hasOwnProperty(id))
        {
            this.orderIds.push(id);
            localStorage.setItem(this.token + '-orderIds', JSON.stringify(this.orderIds));
        }
    }

    private removeOrderId(id) {
        var idx = this.orderIds.indexOf(id);
        if(idx >= 0) {
            this.orderIds.splice(idx, 1);
            localStorage.setItem(this.token + '-orderIds', JSON.stringify(this.orderIds));

            for(var i = 0; i < this.myOrders.length; i++)
            {
                if(this.myOrders[i].id == id) {
                    this.myOrders.splice(i, 1);
                    break;
                }

                //TODO: add to past orders...
            }
        }
    }


    private saveBlockNumber(evnt) {
        if(this.blockHigh.isLessThan(evnt.blockNumber)) {
            this.blockHigh = new BigNumber(evnt.blockNumber);
            localStorage.setItem(this.token + '-blockHigh', this.blockHigh.toString(10));
        }
    }

    private startGettingPastOrders() {
        var that = this;

        this.node.getBlockNumber((e, bn) => {
            that.blockLow = new BigNumber(localStorage.getItem(that.token + '-blockLow'));
            if(!that.blockLow || that.blockLow.isEqualTo(0))
            {
                localStorage.setItem(that.token + '-blockLow', that.blockLow.toString(10));
            }

            this.node.subscribe(that.token, bn.plus(1), (err, evnt) => {
                that.saveBlockNumber(evnt);
                that.processEvent(evnt);
            });

            if(that.blockLow.isGreaterThan(that.blockCreated)) {
                that.node.getPastEvents(that.token, that.blockCreated, that.blockLow, (er, events: any[]) => {
                    events.forEach(ev => that.processEvent(ev));
                    that.blockLow = new BigNumber(that.blockCreated);
                    localStorage.setItem(that.token + '-blockLow', that.blockLow.toString(10));
                    that.startGettingRecentOrders(bn);
                });
            } else 
                that.startGettingRecentOrders(bn);
        });
    }

    private startGettingRecentOrders(currentBlock: BigNumber) {
        var that = this;
        that.blockHigh = new BigNumber(localStorage.getItem(that.token + '-blockHigh'));
        if(!that.blockHigh || that.blockHigh.isEqualTo(0))
        {
            that.blockHigh = new BigNumber(currentBlock);
            localStorage.setItem(that.token + '-blockHigh', that.blockHigh.toString(10));
        }
        if(that.blockHigh.isLessThan(currentBlock)) {
            that.node.getPastEvents(that.token, that.blockHigh, currentBlock, (er, events: any[]) => {
                events.forEach(ev => that.processEvent(ev));
                that.blockHigh = new BigNumber(currentBlock);
                localStorage.setItem(that.token + '-blockHigh', that.blockHigh.toString(10));
                that.mode = 'synced';
            });
        } else {
            that.mode = 'synced';
        }
    }

    private getRecentOrderInfo() {
        //build list of orders that need more info
        //once all recent orders gotten, round up all that need price info and get it
        //get up-to-date amounts on orders that are within 10% of best price, or within top 20 best price.
        ; // I know sunc isn't the past tense of sync
    }

    processEvent(ev) {
        if(ev.event == 'CreatedToken') {
            localStorage.setItem(this.token + '-blockCreated', ev.blockNumber.toString());
            return;
        }

        var id = ev.returnValues.orderId.toString();
        var ord: Order = this.orders[id];
        if(!ord)
            ord = Order.load(id);
        if(!ord) {
            ord = new Order();
            ord.id = id;
        }

        switch(ev.event) {
            case 'CreatedBuy':
                ord.buy = true;
                ord.price = new BigNumber(ev.returnValues.price);
                ord.origAmount = new BigNumber(ev.returnValues.amount);
                ord.owner = ev.returnValues.owner;
                if(ord.owner == this.walletAddress)
                    this.myOrders.push(ord);
                this.bid.insert(ord);
                this.bidSum = this.calcSum(this.bid.array);
                break;
            case 'CreatedSell':
                ord.buy = false;
                ord.price = new BigNumber(ev.returnValues.price);
                ord.origAmount = new BigNumber(ev.returnValues.amount);
                ord.owner = ev.returnValues.owner;
                if(ord.owner == this.walletAddress)
                    this.myOrders.push(ord);
                this.ask.insert(ord);
                this.askSum = this.calcSum(this.ask.array);
                break;
            case 'FilledBuy':
                ord.buy = true;
                ord.addFill(ev);
                //TODO: update history buckets
                break;
            case 'FilledSell':
                ord.buy = false;
                ord.addFill(ev);
                //TODO: update history buckets
                break;
            case 'CancelledOrder':
                ord.finished = true;
                ord.amount = ord.estAmount = new BigNumber(0);
                break;
            default: 
                this.node.err('unknown event type ' + ev.event);
                break;
        }

        ord.estimateAmount();

        //if estimated amount falls below min threshold, delete order from active lists
        if(ord.estAmount.isLessThanOrEqualTo(ord.minThresh()))
        {
            delete this.orders[id];
            this.removeOrderId(id);
            var book = ord.buy ? this.bid : this.ask;
            this.removeFromBook(book, ord.id);

            //TODO: delete from local storage
            ord.delete();
        } else {
            this.orders[id] = ord;
            ord.save();
        }
    }

    removeFromBook(book: SortedArray, id: string): Order | null {
        for(var i = 0; i < book.array.length; i++) {
            if(book.array[i].id == id) {
                return book.array.splice(i, 1)[0];
            }
        }
        return null;
    }

    getCoinBookBalance(): BigNumber {
        var sum: BigNumber = new BigNumber(0);

        this.orderIds.forEach(i => {
            var o: Order = this.orders[i];
            if(o && o.owner == this.walletAddress && !o.buy) {
                sum = sum.plus(o.amount);
            }
        });

        return sum;
    }

    getBaseBookBalance(): BigNumber {
        var that = this;
        var sum: BigNumber = new BigNumber(0);

        this.orderIds.forEach(i => {
            var o: Order = this.orders[i];
            if(o && o.owner == this.walletAddress && o.buy) {
                sum = sum.plus(o.amount);
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
