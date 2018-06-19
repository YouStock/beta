import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule} from '@angular/core'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { NgxQRCodeModule } from 'ngx-qrcode2';
import { NgxElectronModule } from 'ngx-electron';
import { ImageCropperComponent } from "ngx-img-cropper";
import { SimpleModalModule } from 'ngx-simple-modal';
import { ClipboardModule } from 'ngx-clipboard';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { WalletComponent } from './wallet/wallet.component';
import { MarketComponent } from './market/market.component';
import { YourstockComponent } from './yourstock/yourstock.component';
import { NavbarComponent } from './navbar/navbar.component';
import { WalletOpenComponent } from './wallet-open/wallet-open.component';
import { WalletNewComponent } from './wallet-new/wallet-new.component';
import { SettingsComponent } from './settings/settings.component';
import { PasswordComponent } from './password/password.component';

import { NodeService } from './node.service';
import { CoreService } from './core.service';
import { DataService } from './data.service';
import { SettingsService } from './settings.service';
import { MarketService } from './market/market.service';

import { BaseUnitPipe } from './pipe/base-unit.pipe';
import { BrowseComponent } from './browse/browse.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        DashboardComponent,
        WalletComponent,
        MarketComponent,
        YourstockComponent,
        NavbarComponent,
        WalletOpenComponent,
        WalletNewComponent,
        SettingsComponent,
        PasswordComponent,
        ImageCropperComponent,
        BaseUnitPipe,
        BrowseComponent
    ],
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        ToastModule.forRoot(),
        ClipboardModule,
        NgxElectronModule,
        FormsModule,
        NgxQRCodeModule, 
        SimpleModalModule,
        HttpClientModule,
        BsDropdownModule.forRoot(),
    ],
    providers: [ 
        NodeService, 
        DataService, 
        SettingsService, 
        CoreService, 
        MarketService 
    ],
    entryComponents: [ PasswordComponent ],
    bootstrap: [ AppComponent ]
})
export class AppModule { }
