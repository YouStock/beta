import { Component, OnInit } from '@angular/core';
import { ParamMap, Router, ActivatedRoute } from '@angular/router';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { DataService, StockInfo } from '../data.service';
import { NodeService } from '../node.service';

@Component({
    selector: 'app-market',
    templateUrl: './market.component.html',
    styleUrls: ['./market.component.scss']
})
export class MarketComponent implements OnInit {

    stock: StockInfo = <any>{}; //TODO: get stock info from data service

    constructor(private router: Router, private route: ActivatedRoute, private data: DataService, private node: NodeService) { 
        var token = this.route.snapshot.params.token;
        var that = this;
        if(token) {
            data.getStockInfo(token, (err, info: StockInfo) => {
                that.stock = info;
            });
        } else {
            node.wallet.getAddress((err, ad) => {
                router.navigate(['market', ad]);
            });
        }
    }

    ngOnInit() {


    }

}
