import { Component, ViewContainerRef } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { setTheme } from 'ngx-bootstrap/utils';

import { CoreService } from './core.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'YouStock';

    constructor(public toastr: ToastsManager, vcr: ViewContainerRef, private core: CoreService) {
        setTheme('bs3');
        this.toastr.setRootViewContainerRef(vcr);
    }
}
