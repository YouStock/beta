import { Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { NodeService } from './node.service';
import { SettingsService } from './settings.service';

@Injectable()
export class DataService {

    constructor(private node: NodeService, private settings: SettingsService, private http: HttpClient, private toastr: ToastsManager ) { }

    getStockInfo(address: string, f: (err: any, info: StockInfo) => void): void {
        var stockInfo = JSON.parse(localStorage.getItem(address + '-stockInfo'));
        if(stockInfo) // TODO: recheck server data after too much time has passed?
            f(null, stockInfo);
        else
            this.getFreshStockInfo(address, f);
    }

    getFreshStockInfo(address: string, f: (err: any, info: StockInfo) => void): void {
        var that = this;
        this.http.get([this.settings.dataServiceUrl, 'get', address].join('/')).subscribe(
            (data: any) => {
                if(that.verifySig(address, that.getMessage(data), data.sig)) {
                    localStorage.setItem(address + '-stockInfo', JSON.stringify(data));
                    f(null, {
                        fullname: data.fullname,
                        ticker: data.ticker,
                        img: data.img,
                        bio: data.bio,
                    });
                } else {
                    f('Error getting stock data, invalid signature', null);
                }
            }, err => { f(err, null); });
    }

    private verifySig(address: string, message: string, sig: string): boolean {
        return this.node.verifySig(address, message, sig);
    }

    private getMessage(data: any): string {
        return [data.img, data.fullname, data.ticker, data.bio, data.timestamp].join('');
    }

    setStockInfo(data: StockInfo): void {
        var d = <any>data;
        d.timestamp = new Date().getTime();
        var that = this;
        this.node.wallet.signMessage(this.getMessage(d), (e, sig) => {
            if(e) return that.node.err(e);
            d.sig = sig;
            that.node.wallet.getAddress((err, adr) => {
                if(err) return that.node.err(err);
                localStorage.setItem(adr + '-stockInfo', JSON.stringify(d));
                that.http.put([that.settings.dataServiceUrl, 'put', adr].join('/'), d).subscribe(
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
    ticker: string;
    img: string;
    bio: string;
}
