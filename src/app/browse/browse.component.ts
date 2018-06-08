import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
    selector: 'app-browse',
    templateUrl: './browse.component.html',
    styleUrls: ['./browse.component.scss']
})
export class BrowseComponent implements OnInit {

    results = [];

    constructor(private data : DataService) {
        var that = this;
        data.browse(r => that.results = r);
    }

    ngOnInit() {
    }
}
