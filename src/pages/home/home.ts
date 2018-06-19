import { Component, NgZone } from '@angular/core';
import { NavController, ModalController, AlertController, Platform } from 'ionic-angular';

import { ConnectToPage } from '../connect-to/connect-to';
import { DevicePage } from '../device/device';

import { ModelProvider } from '../../providers/modelprovider';
import { BLEProvider } from '../../providers/bleprovider';
import { EPGDevice } from '../../models/epgdevice';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {

  private _pairedDevice: EPGDevice = null;
  private _peripheralData: any = null;

  constructor(public navCtrl: NavController, public modalCtrl: ModalController, public alertCtrl: AlertController,
                private model: ModelProvider, private _ble: BLEProvider,
                public plt: Platform, private ngZone: NgZone) {
    console.log(this.plt.platforms());
  }

  ionViewDidLoad() {
    console.log('HomePage::ionViewDidLoad');

    if(this.model.getPairedDevice()) {
      this.modelUpdated();
    }

    this.model.updateObserver().subscribe(() => this.modelUpdated() );
  }

  private modelUpdated() {
    console.log("HomePage::modelUpdated");
    this.ngZone.run(() => {
      this._pairedDevice = this.model.getPairedDevice();
      this._peripheralData = this.model.getPeripheralData();
    });
  }

  pairDevice() {
    let myModal = this.modalCtrl.create(ConnectToPage);
    myModal.onDidDismiss(data => {});
    myModal.present();
  }

  unpairDevice() {
    console.log('HomePage::unpairDevice');
    this._ble.disconnect().subscribe(
      peripheralData => {
        console.log('HomePage::unpairDevice: received peripheralData');

        this.model.unpair();
      }
    );
  }

  goToDevice() {
    this.navCtrl.push(DevicePage);
  }

  enableBluetooth() {
    let modal = this.modalCtrl.create({
      title: 'Enabling BLE',
      subTitle: 'Permissions needed:',
      message: "Android needs Bluetooth and Location",
      buttons: ['OK']
    });
    modal.present();

    this._ble.enable();
  }
}
