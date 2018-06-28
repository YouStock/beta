import { Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { NodeService } from './node.service';
import { SettingsService } from './settings.service';

const putHeaders = new HttpHeaders().set("Content-Type", "application/json");

@Injectable()
export class DataService {

    constructor(private node: NodeService, private settings: SettingsService, private http: HttpClient, private toastr: ToastsManager ) { }

    getStockInfo(address: string, f: (err: any, info: StockInfo) => void): void {
        var stockInfo = JSON.parse(localStorage.getItem(this.stockInfoStorageKey(address)));
        if(stockInfo) // TODO: recheck server data after too much time has passed?
            f(null, stockInfo);
        else
            this.getFreshStockInfo(address, f);
    }

    stockInfoStorageKey(address: string): string {
        if(this.settings.isTest())
            return address + '-stockInfoTest';
        else
            return address + '-stockInfo';
    }

    getFreshStockInfo(address: string, f: (err: any, info: StockInfo) => void): void {
        var that = this;
        this.http.get([this.settings.dataServiceUrl, 'get', address].join('/')).subscribe(
            (data: any) => {
                if(!data) return f(null, null);
                if(that.verifySig(address, that.getMessage(data), data.sig)) {
                    f(null, that.getSoonest(address, data));
                } else {
                    f('Error getting stock data, invalid signature', null);
                }
            }, err => { f(err, null); });
    }

    getLocalStockInfo(address: string): StockInfo {
        var current = JSON.parse(localStorage.getItem(this.stockInfoStorageKey(address)));
        return current;
    }

    setLocalStockInfo(address: string, info: StockInfo) {
        localStorage.setItem(this.stockInfoStorageKey(address), JSON.stringify(info));
    }

    private getSoonest(address: string, data: any): StockInfo {
        var current = JSON.parse(localStorage.getItem(this.stockInfoStorageKey(address)));
        if(current.timestamp > data.timestamp) {
            data = current;
        } else {
            localStorage.setItem(this.stockInfoStorageKey(address), JSON.stringify(data));
        }
        return {
            fullname: data.fullname,
            img: data.img,
            bio: data.bio,
            address: address
        };
    }

    browse(f: (r: StockInfo[]) => void): void {
        var that = this;
        this.http.get([this.settings.dataServiceUrl, 'browse'].join('/')).subscribe(
            (data: any) => that.handleResults(data, f),
            (err) => that.node.err(err)
        );
    }

    search(input: string, f: (r: StockInfo[]) => void): void {
        var that = this;
        this.http.post([this.settings.dataServiceUrl, 'search'].join('/'), input).subscribe(
            (data: any) => that.handleResults(data, f),
            (err) => that.node.err(err)
        );
    }

    private handleResults(data: any, f: (r: StockInfo[]) => void): void {
        var that = this;
        if(data && data.length) {
            var results = [];
            data.forEach(d => {
                if(that.verifySig(d.address, that.getMessage(d), d.sig)) {
                    results.push(that.getSoonest(d.address, d));
                }
            });
            f(results);
        }
    }

    private verifySig(address: string, message: string, sig: string): boolean {
        return this.node.verifySig(address, message, sig);
    }

    private getMessage(data: any): string {
        return [data.img, data.fullname, data.ticker, data.bio, data.timestamp].join('');
    }

    setStockInfo_deprecated(data: StockInfo): void {
        var d = <any>data;
        d.timestamp = new Date().getTime();
        var that = this;
        this.node.wallet.signMessage(this.getMessage(d), (e, sig) => {
            if(e) return that.node.err(e);
            d.sig = sig;
            that.node.wallet.getAddress((err, adr) => {
                if(err) return that.node.err(err);
                localStorage.setItem(this.stockInfoStorageKey(adr), JSON.stringify(d));
                that.http.put([that.settings.dataServiceUrl, 'put', adr].join('/'), d, {headers: putHeaders}).subscribe(
                    r => { 
                        if(r == 'ok') 
                            that.toastr.success('Successfully uploaded stock info'); 
                        else 
                            that.node.err(r); 
                    },
                    er => that.node.err(er)
                );
            });
        });
    }
}

export interface StockInfo {
    fullname: string;
    img: string;
    bio: string;
    address: string;
}
