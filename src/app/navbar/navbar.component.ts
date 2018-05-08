import { Component, OnInit } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import * as $ from 'jquery';

@Component({
    selector: 'app-navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

    appTheme = 'superhero';
    themes = ['superhero', 'cosmo', 'flatly', 'cerulean', 'cyborg', 'readable', 'slate', 'spacelab', 'journal'];
    isCollapsed = true;

    constructor() { 

        this.appTheme = localStorage.getItem('appTheme') || this.appTheme;
        this.setTheme(this.appTheme);

    }

    setTheme(theme) {
        this.appTheme = theme;
        localStorage.setItem('appTheme', theme);
        var href = 'https://cdnjs.cloudflare.com/ajax/libs/bootswatch/3.3.7/' + theme + '/bootstrap.min.css';
        if($('head link[title="bootswatch"]').length == 0) {
            var link = '<link title="bootswatch" rel="stylesheet" href="' + href + '" type="text/css" media="screen">';
            $('head').append(link);
        }
        $('head link[title="bootswatch"]').attr('href', href);
    };

    ngOnInit() {
    }
}
