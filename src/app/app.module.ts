import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { MyApp } from './app.component';
import { TabsPage } from '../pages/tabs/tabs';
import { HomePage } from '../pages/home/home';
import { StatsPage } from '../pages/stats/stats';
import { LogPage } from '../pages/log/log';
import { AccountPage } from '../pages/account/account';
import { ConnectToPage } from '../pages/connect-to/connect-to';
import { DevicePage } from '../pages/device/device';

//import { DemoConnectPage } from '../pages/democonnect/democonnect';
//import { DemoDisplayPage } from '../pages/demodisplay/demodisplay';

import { ConnectModalPage } from '../pages/connect-modal/connect-modal';
import { ChartsPage } from '../pages/charts/charts';

import { ExpandableHeader } from '../components/expandable-header/expandable-header';
import { ShrinkingSegmentHeader } from '../components/shrinking-segment-header/shrinking-segment-header';
import { ExpandableComponent } from '../components/expandable/expandable';

import { BLE } from '@ionic-native/ble';
import { IonicStorageModule } from '@ionic/storage';
import { ModelProvider } from '../providers/modelprovider';
import { BLEProvider } from '../providers/bleprovider';

@NgModule({
  declarations: [
    MyApp,
    TabsPage,
    HomePage,
    StatsPage,
    LogPage,
    AccountPage,
    ConnectToPage,
    DevicePage,
    // DemoConnectPage,
    // DemoDisplayPage,
    ConnectModalPage,
    ChartsPage,
    ExpandableHeader,
    ShrinkingSegmentHeader,
    ExpandableComponent
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    TabsPage,
    HomePage,
    StatsPage,
    LogPage,
    AccountPage,
    ConnectToPage,
    DevicePage,
    //DemoConnectPage,
    //DemoDisplayPage,
    ConnectModalPage,
    ChartsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    BLE,
    ModelProvider,
    BLEProvider
  ]
})
export class AppModule {}
