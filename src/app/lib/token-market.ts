import * as SortedArray from 'sorted-array';
import { BigNumber } from 'bignumber.js';
import { Order } from './order';
import { NodeService } from '../node.service';
import { DataService } from '../data.service';
import { SettingsService } from '../settings.service';
import { WEI_MULTIPLIER, PRICE_RATIO, HOUR_MILLIS } from './constants';
import { Utils } from './utils';

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
    blockLow: BigNumber = new BigNumber(0);
    blockHigh: BigNumber = new BigNumber(0);
    blockCreated: BigNumber = new BigNumber(0);

    mySortProperty: string = 'timestamp';
    mySortDir: boolean = false;

    mode: string = 'syncing';

    eventBuffer = {};

    marketHours: any[];
    marketByHour: any = {};
    currentHour: any = {};
    currentHourL: any[];

    onDataLoad: ()=>void;

    constructor(public token: string, public node: NodeService, private settings: SettingsService, private data: DataService) { 
        this.orderIds = JSON.parse(localStorage.getItem(this.tokenStorageKey(token, 'orderIds'))) || [];
        var that = this;

        this.myOrders = [];

        that.blockCreated = new BigNumber(localStorage.getItem(this.tokenStorageKey(token, 'blockCreated')));
        that.blockHigh = new BigNumber(localStorage.getItem(this.tokenStorageKey(token, 'blockHigh')));
        that.blockLow = new BigNumber(localStorage.getItem(this.tokenStorageKey(token, 'blockLow')));

        this.restoreMarketData(() => {
            node.wallet.getAddress((e, walletAddress) => {
                walletAddress = Utils.zeroX(walletAddress);
                that.walletAddress = walletAddress;
                var staleIds = [];
                for(var i = 0; i < that.orderIds.length; i++)
                {
                    var ord = Order.load(that.orderIds[i], node.isTest());
                    if(ord) {
                        that.orders[that.orderIds[i]] = ord
                        if(ord.amount.times(ord.price).isGreaterThanOrEqualTo(that.settings.minOrderSize)) {
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

                that.calcAskSum();
                that.calcBidSum();

                //TODO: get order info for any found stale ids (should never have any... but just in case)
                //
                //start getting orders
                if(that.blockCreated.isNaN() || that.blockCreated.isEqualTo(0)) {
                    node.getBlockCreated(token, (e, bc) => {
                        if(bc.isLessThanOrEqualTo(0)) return node.err('invalid block created ' + bc.toString(10) + ' for token ' + token);
                        that.blockCreated = bc;
                        localStorage.setItem(that.tokenStorageKey(token, 'blockCreated'), bc.toString(10));
                        that.startGettingPastOrders();
                    });
                } else {
                    that.startGettingPastOrders();
                }
            });
        });
    }

    addMarketHourData(d: any[]) {
        this.marketHours.push(d);
        this.marketByHour[d[0]] = d;
    }

    restoreMarketData(f: ()=>void) {
        var that = this;
        var token = this.token;
        this.data.getMarketHours(token, (d) => {
            var last, cur, nextT, lastL = [0,0,0,0,0,0];
            var now = new Date().getTime();
            that.marketHours = []; //clear data

            if(d.length > 0) {
                last = d[0];
                lastL = [last.t, last.h, last.l, 0, last.c, last.v];
                that.addMarketHourData(lastL);

                for(var  i = 1; i < d.length; i++) {
                    nextT = last.t + HOUR_MILLIS; 
                    cur = d[i];

                    while(cur.t > nextT && nextT < now) {
                        lastL = [nextT, last.c, last.c, last.c, last.c, 0];
                        that.addMarketHourData(lastL);
                        nextT = nextT + HOUR_MILLIS;
                    }

                    lastL = [nextT, cur.h, cur.l, last.c, cur.c, cur.v];
                    that.addMarketHourData(lastL);
                    last = cur;
                }
            }
            else {
                last = {
                    t: now - (HOUR_MILLIS * 24), 
                    h: 0, 
                    l: 0, 
                    o: 0, 
                    c: 0, 
                    v: 0
                };
                lastL = [last.t, last.h, last.l, last.o, last.c, last.v];
                that.addMarketHourData(lastL);
            }

            nextT = last.t + HOUR_MILLIS; 
            while(nextT < now) {
                that.addMarketHourData([nextT, last.c, last.c, last.c, last.c, 0]);
                nextT = nextT + HOUR_MILLIS;
            }

            var c: any = {};
            c.h = c.l = c.o = c.price = last.c;
            c.v = 0;
            c.t = nextT;
            that.currentHour = c;
            that.currentHourL = that.marketHours[that.marketHours.length-1];

            f();
        });
    }

    tokenStorageKey(token: string, field: string): string {
        if(this.settings.isTest())
            return token + '-' + field + 'test';
        else
            return token + '-' + field;
    }

    addCurrentHour(ev: any, o: Order) {
        var size = o.price.times(ev.returnValues.amount).div(WEI_MULTIPLIER).toNumber();
        var price = o.price.div(PRICE_RATIO).toNumber();

        this.node.getBlockTime(ev.blockNumber, (blockTime) => {
            var timestamp = this.data.getHourU(blockTime);

            if(timestamp < this.currentHour.t)
            {
                this.data.addOldHour(this.token, size, price, timestamp); 
                if(this.marketByHour.hasOwnProperty(timestamp)) {
                    var cc = this.marketByHour[timestamp];
                    cc.v = cc.v + size;
                    if(price > cc.h) cc.h = price;
                    if(price < cc.l) cc.l = price;
                }
            }

            else {
                this.currentHour.v = this.currentHour.v + size;
                if(price > this.currentHour.h)
                    this.currentHour.h = price;
                else if(price  < this.currentHour.l)
                    this.currentHour.l = price;
                this.currentHour.price = price;
            }
        });
    }

    marketHourTick() {
        var c = this.currentHour;
        c.c = c.price;
        this.data.addMarketHour(this.token, c.t, c.h, c.l, c.c, c.v);
        c.h = c.l = c.o = c.c = c.price;
        c.v = 0;
        c.t = c.t + HOUR_MILLIS;
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
            localStorage.setItem(this.tokenStorageKey(this.token, 'orderIds'), JSON.stringify(this.orderIds));
        }
    }

    private removeOrderId(id) {
        var idx = this.orderIds.indexOf(id);
        if(idx >= 0) {
            this.orderIds.splice(idx, 1);
            localStorage.setItem(this.tokenStorageKey(this.token, 'orderIds'), JSON.stringify(this.orderIds));

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

    //TODO: add method to reset blockLow/blockHigh in local storage so orders can be refetched from blockchain


    private saveBlockNumber(evnt) {
        if(this.blockHigh.isLessThan(evnt.blockNumber)) {
            this.blockHigh = new BigNumber(evnt.blockNumber);
            localStorage.setItem(this.tokenStorageKey(this.token, 'blockHigh'), this.blockHigh.toString(10));
        }
    }

    private startGettingPastOrders() {
        var that = this;

        this.node.getBlockNumber((e, bn) => {
            if(that.blockLow.isNaN() || that.blockLow.isEqualTo(0))
            {
                that.blockLow = new BigNumber(bn);
                localStorage.setItem(that.tokenStorageKey(that.token, 'blockLow'), that.blockLow.toString(10));
            }

            that.node.subscribe(that.token, bn.plus(1), (err, evnt) => {
                if(err) return that.node.err(err);
                that.saveBlockNumber(evnt);
                that.processEvent(evnt);
            });

            if(that.blockLow.isGreaterThan(that.blockCreated)) {
                that.node.getPastEvents(that.token, that.blockCreated, that.blockLow, (er, events: any[]) => {
                    events.forEach(ev => that.processEvent(ev));
                    that.blockLow = new BigNumber(that.blockCreated);
                    localStorage.setItem(that.tokenStorageKey(that.token, 'blockLow'), that.blockLow.toString(10));
                    that.startGettingRecentOrders(bn);
                });
            } else 
                that.startGettingRecentOrders(bn);
        });
    }

    private startGettingRecentOrders(currentBlock: BigNumber) {
        var that = this;
        that.blockHigh = new BigNumber(localStorage.getItem(that.tokenStorageKey(that.token , 'blockHigh')));
        if(that.blockHigh.isNaN() || that.blockHigh.isEqualTo(0))
        {
            that.blockHigh = new BigNumber(currentBlock);
            localStorage.setItem(that.tokenStorageKey(that.token , 'blockHigh'), that.blockHigh.toString(10));
        }
        if(that.blockHigh.isLessThan(currentBlock)) {
            that.node.getPastEvents(that.token, that.blockHigh, currentBlock, (er, events: any[]) => {
                events.forEach(ev => that.processEvent(ev));
                that.blockHigh = new BigNumber(currentBlock);
                localStorage.setItem(that.tokenStorageKey(that.token , 'blockHigh'), that.blockHigh.toString(10));
                that.mode = 'synced';
                if(that.onDataLoad) that.onDataLoad();
                that.node.detectChanges();
            });
        } else {
            that.mode = 'synced';
            if(that.onDataLoad) that.onDataLoad();
            that.node.detectChanges();
        }
    }

    private getRecentOrderInfo() {
        //build list of orders that need more info
        //once all recent orders gotten, round up all that need price info and get it
        //get up-to-date amounts on orders that are within 10% of best price, or within top 20 best price.
        ; // I know sunc isn't the past tense of sync
    }

    private addToBuffer(ev: any, id: string) {
        if(!this.eventBuffer.hasOwnProperty(id))
            this.eventBuffer[id] = [];
        this.eventBuffer[id].push(ev);
    }

    processEvent(ev) {
        if(ev.event == 'CreatedToken') {
            localStorage.setItem(this.tokenStorageKey(this.token , 'blockCreated'), ev.blockNumber.toString());
            return;
        }

        var id = ev.returnValues.orderId.toString();
        var ord: Order = this.orders[id];
        if(!ord)
            ord = Order.load(id, this.node.isTest());
        if(!ord) {
            //if no order exists, and this isn't a create event, place in buffer
            //TODO: process buffer after new order creations
            if(!ev.event.startsWith('Created')) {
                this.addToBuffer(ev, id);
                return;
            }

            ord = new Order();
            ord.id = id;
        }

        switch(ev.event) {
            case 'CreatedBuy':
                ord.buy = true;
                ord.price = new BigNumber(ev.returnValues.price);
                ord.origAmount = new BigNumber(ev.returnValues.amount);
                ord.amount = new BigNumber(ord.origAmount);
                ord.owner = ev.returnValues.owner;
                if(ord.owner == this.walletAddress)
                    this.myOrders.push(ord);
                this.bid.insert(ord);
                this.bidSum = this.calcBidSum();
                break;
            case 'CreatedSell':
                ord.buy = false;
                ord.price = new BigNumber(ev.returnValues.price);
                ord.origAmount = new BigNumber(ev.returnValues.amount);
                ord.amount = new BigNumber(ord.origAmount);
                ord.owner = ev.returnValues.owner;
                if(ord.owner == this.walletAddress)
                    this.myOrders.push(ord);
                this.ask.insert(ord);
                this.askSum = this.calcAskSum();
                break;
            case 'FilledBuy':
                ord.buy = true;
                ord.addFill(ev);
                this.addCurrentHour(ev, ord);
                break;
            case 'FilledSell':
                ord.buy = false;
                ord.addFill(ev);
                this.addCurrentHour(ev, ord);
                break;
            case 'CancelledOrder':
                ord.finished = true;
                ord.amount = new BigNumber(0);
                break;
            default: 
                this.node.err('unknown event type ' + ev.event);
                break;
        }

        ord.estimateAmount();

        //if amount falls below min threshold, delete order from active lists
        if(ord.amount.times(ord.price).isLessThan(this.settings.minOrderSize))
        {
            delete this.orders[id];
            this.removeOrderId(id);
            var book = ord.buy ? this.bid : this.ask;
            this.removeFromBook(book, ord.id);

            //TODO: delete from local storage
            ord.delete(this.settings.isTest());
        } else {
            this.addOrderId(id);
            this.orders[id] = ord;
            ord.save(this.settings.isTest());
        }
        this.node.detectChanges();
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

    calcAskSum(): BigNumber {
        var entries: Order[] = this.ask.array;
        var sum = new BigNumber(0);
        for(var i = 0; i < entries.length; i++) {
            sum = sum.plus(entries[i].amount);
            entries[i].sum = new BigNumber(sum);
        }
        return sum;
    }

    calcBidSum(): BigNumber {
        var entries: Order[] = this.bid.array;
        var sum = new BigNumber(0);
        for(var i = 0; i < entries.length; i++) {
            sum = sum.plus(entries[i].price.times(entries[i].amount));
            entries[i].sum = new BigNumber(sum);
        }
        return sum;
    }

    getBuyListingsForSell(amount: BigNumber, price: BigNumber): string[] {
        if(price.isLessThanOrEqualTo(0)) return [];
        var matches: string[] = [];
        var total: BigNumber = new BigNumber(0);
        var target: BigNumber = new BigNumber(3).times(amount); //search up to 3 times target amount
        for(var i = 0; i < this.bid.array.length; i++) {
            var listing: Order = this.bid.array[i];
            if(listing.price.isGreaterThanOrEqualTo(price))
            {
                if(listing.amount.times(listing.price).isGreaterThanOrEqualTo(this.settings.minOrderSize)) {
                    matches.push(listing.id);
                    total = total.plus(listing.amount);
                }

                if(total.isGreaterThanOrEqualTo(target))
                    break; // we've found ENOUGH!
            }
            else
                break; //no more listings match this price
        }

        return matches;
    }

    getSellListingsForBuy(amount: BigNumber, price: BigNumber): string[] {
        if(price.isLessThanOrEqualTo(0)) return [];
        var matches: string[] = [];
        var total: BigNumber = new BigNumber(0);
        var target: BigNumber = new BigNumber(3).times(amount); //search up to 3 times target amount
        for(var i = 0; i < this.ask.array.length; i++) {
            var listing: Order = this.ask.array[i];
            if(listing.price.isLessThanOrEqualTo(price))
            {
                if(listing.price.isLessThanOrEqualTo(0))
                    continue;

                if(listing.amount.times(listing.price).isGreaterThanOrEqualTo(this.settings.minOrderSize)) {
                    matches.push(listing.id);
                    total = total.plus(listing.amount);
                }

                if(total.isGreaterThanOrEqualTo(target))
                    break; // we've found ENOUGH!
            }
            else
                break; //no more listings match this price
        }

        return matches;
    }

}
