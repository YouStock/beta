import { Injectable } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class DataService {

    constructor() { }

    getStockInfo(address: string, f: (err: any, info: StockInfo) => void): void {
        //TODO:
        return <any>{};
    }

    //TODO: these need to be signed messages inclusing a timestamp
    // data service needs to verify sig and keep track of timestamp for future updates
    setFullName(name: string) {

    }

    setTicker(ticker: string) {

    }

    setImg(img: string) {

    }

    setBio(bio: string) {

    }
}

export interface StockInfo {
    fullname: string;
    ticker: string;
    price: number;
    img: string;
    bio: string;
}
