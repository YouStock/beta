import { Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { BigNumber } from 'bignumber.js';

import { SettingsService } from './settings.service';
import { Order } from './lib/order';
import { HOUR_MILLIS, WEI_MULTIPLIER, PRICE_RATIO } from './lib/constants';

const putHeaders = new HttpHeaders().set("Content-Type", "application/json");

@Injectable()
export class DataService {

    dbs: any = {};

    constructor(private settings: SettingsService, private http: HttpClient, private toastr: ToastsManager) { }

    stockInfoStorageKey(address: string): string {
        if(this.settings.isTest())
            return address + '-stockInfoTest';
        else
            return address + '-stockInfo';
    }

    private getDbOpenRequest(dbName: string, f: (db) => void): any {
        var that = this;
        var request = indexedDB.open(dbName);
        request.onerror = function(event) {
            that.settings.err("Error opening database");
        };

        request.onsuccess = function(evt: any) {
            var db = evt.target.result;

            db.onerror = function(event) {
                that.settings.err("Database error: " + event.target.errorCode);
            };
    
            that.dbs[dbName] = db;
            f(db);
        };

        return request;
    }

    getHourT(timestamp: number): number {
        return timestamp - timestamp % HOUR_MILLIS;
    }

    getHourD(date: Date): number {
        return this.getHourT(date.getTime());
    }

    getHourU(utc_timestamp: any): number {
        return this.getHourT((new BigNumber(utc_timestamp)).times(1000).toNumber());
    }

    private getAddressStocksDatabase(address: string, f: (db) => void): void{
        var dbName = this.getAddressStocksDatabaseName(address);

        if(this.dbs.hasOwnProperty(dbName))
            return f(this.dbs[dbName]);

        var that = this;
        var request = this.getDbOpenRequest(dbName, f); 

        //init db
        request.onupgradeneeded = function(event: any) { 
            var db = event.target.result;
            var objectStore = db.createObjectStore("stocks", { keyPath: "address" });
        };
    }

    private getMarketDatabase(token: string, f: (db) => void): void {
        var dbName = this.getMarketDataBaseName(token);

        if(this.dbs.hasOwnProperty(dbName))
            return f(this.dbs[dbName]);

        var that = this;
        var request = this.getDbOpenRequest(dbName, f); 

        //init db
        request.onupgradeneeded = function(event: any) { 
            var db = event.target.result;
            var objectStore = db.createObjectStore("hours", { keyPath: "t" });
        };
    }

    getAddressStocksDatabaseName(address: string): string {
        if(this.settings.isTest())
            return address + '-stocksTest';
        else
            return address + '-stocks';
    }

    getMarketDataBaseName(token: string): string {
        if(this.settings.isTest())
            return token + '-marketTest';
        else
            return token + '-market';
    }

    getAddressStocks(address: string, f: (res: any[]) => void): void {
        var that = this;
        this.getAddressStocksDatabase(address, db => {
            var r = db.transaction("stocks").objectStore('stocks').getAll();
            r.onsuccess = e => f(e.target.result);
            r.onerror = e => that.settings.err(e);
        });
    }

    addAddressStock(address: string, stock: string, name: string, notes: string, img: string, f: (s) => void): void {
        var that = this;
        this.getAddressStocksDatabase(address, db => {
            var obj = {
                address: stock,
                name: name,
                notes: notes,
                img: img
            };
            var r = db.transaction(["stocks"], "readwrite").objectStore('stocks').put(obj);
            r.onerror = e => that.settings.err(e);
            r.onsuccess = e => f(obj);
        });
    }

    getMarketHours(token: string, f: (d) => void): void {
        var that = this;
        this.getMarketDatabase(token, db => {
            var r = db.transaction("hours").objectStore('hours').getAll();
            r.onerror = e => that.settings.err(e);
            r.onsuccess = e => f(e.target.result);
        });
    }

    /*
     * t: timestamp milliseconds
     * h: high price
     * l: low price
     * b: beginning price
     * v: volume
     */
    addMarketHour(token, t, h, l, c, v): void {
        var that = this;
        t = this.getHourT(t);
        this.getMarketDatabase(token, db => {
            var obj = {t: t, h: h, l: l, c: c, v: v};
            var r = db.transaction(["hours"], "readwrite").objectStore('hours').put(obj);
            r.onerror = e => that.settings.err(e);
        });
    }

    addOldHour(token: string, size: number, price: number, timestamp: number): void {
        //find correct bucket and add or create in database
        var that = this;
        var t = this.getHourT(timestamp);
        this.getMarketDatabase(token, db => {
            var r = db.transaction("hours").objectStore('hours').get(t);
            r.onsuccess = e => {
                var obj = e.target.result;
                var v = size;
                var p = price;
                
                if(obj) {
                    obj.v = obj.v + v;
                    if(p > obj.h) obj.h = p;
                    if(p < obj.l) obj.l = p;
                    obj.c = p;
                } else {
                    obj = {t: t, h: p, l: p, c: p, v: v};
                }

                var rr = db.transaction(["hours"], "readwrite").objectStore('hours').put(obj);
                rr.onerror = e => that.settings.err(e); 
            };
            r.onerror = e => that.settings.err(e);
        });
    }
}

export interface StockInfo {
    fullname: string;
    img: string;
    bio: string;
    address: string;
}
