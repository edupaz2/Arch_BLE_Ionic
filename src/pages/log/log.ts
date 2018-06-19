import { Component, ViewChild, NgZone } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';

import { ConnectToPage } from '../connect-to/connect-to';
import { DevicePage } from '../device/device';

import { ModelProvider } from '../../providers/modelprovider';
import { BLEProvider } from '../../providers/bleprovider';
import { EPGDevice } from '../../models/epgdevice';

@Component({
  selector: 'page-log',
  templateUrl: 'log.html',
})
export class LogPage {
  @ViewChild('content') content:any;

  private _pairedDevice: EPGDevice = null;

  private _dates: Date[] = [];
  private _doses: number[] = [];

  constructor(public navCtrl: NavController, public modalCtrl: ModalController,
              private model: ModelProvider, private ble: BLEProvider, private ngZone: NgZone) {
  }

  ionViewDidLoad() {
    console.log('LogPage::ionViewDidLoad');

    if(this.model.getPairedDevice()) {
      this.modelUpdated();
    }

    this.model.updateObserver().subscribe(() => this.modelUpdated() );
  }

  private modelUpdated() {
    console.log("LogPage::modelUpdated");

    this._pairedDevice = this.model.getPairedDevice();

    this.ngZone.run(() => {
      let devDates = this._pairedDevice.getDates();
      let devDoses = this._pairedDevice.getDoses();
      for (let i = this._dates.length; i < devDates.length; ++i) {
        this._dates.push(devDates[i]);
        this._doses.push(devDoses[i]);
      }

      this.content.scrollToBottom(100);
    });
  }

  pairDevice() {
    let myModal = this.modalCtrl.create(ConnectToPage);
    myModal.onDidDismiss(data => {});
    myModal.present();
  }

  goToDevice() {
    this.navCtrl.push(DevicePage);
  }

}
