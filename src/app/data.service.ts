import { Injectable } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { NodeService } from './node.service';

@Injectable()
export class DataService {

    constructor(private node: NodeService) { }

    getStockInfo(address: string, f: (err: any, info: StockInfo) => void): void {
        //TODO: use a real data service
        f(null, {
            fullname: localStorage.getItem(address + '-fullName'),
            ticker: localStorage.getItem(address + '-ticker'),
            img: localStorage.getItem(address + '-img'),
            bio: localStorage.getItem(address + '-bio'),
        });
    }

    //TODO: group all these into a single message for a single signature requirement 
    //TODO: these need to be signed messages inclusing a timestamp
    // data service needs to verify sig and keep track of timestamp for future updates
    setFullName(name: string) {
        this.node.wallet.getAddress((e, a) => {
            localStorage.setItem(a + '-fullName', name);
        });
    }

    setTicker(ticker: string) {
        this.node.wallet.getAddress((e, a) => {
            localStorage.setItem(a + '-ticker', ticker);
        });
    }

    setImg(img: string) {
        this.node.wallet.getAddress((e, a) => {
            localStorage.setItem(a + '-img', img);
        });
    }

    setBio(bio: string) {
        this.node.wallet.getAddress((e, a) => {
            localStorage.setItem(a + '-bio', bio);
        });
    }
}

export interface StockInfo {
    fullname: string;
    ticker: string;
    img: string;
    bio: string;
}
