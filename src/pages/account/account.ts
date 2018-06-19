import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';

import { ConnectToPage } from '../connect-to/connect-to';
import { DevicePage } from '../device/device';

import { ModelProvider } from '../../providers/modelprovider';
import { BLEProvider } from '../../providers/bleprovider';
import { EPGDevice } from '../../models/epgdevice';

@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
})
export class AccountPage {

  private _pairedDevice: EPGDevice = null;
  
  items: any = [];
  itemExpandHeight: number = 200;

  constructor(public navCtrl: NavController,  public modalCtrl: ModalController,
              private model: ModelProvider, private ble: BLEProvider) {

    this.items = [
      {expanded: false},
      {expanded: false},
      {expanded: false},
      {expanded: false},
      {expanded: false},
      {expanded: false},
      {expanded: false},
      {expanded: false},
      {expanded: false},
    ];
  }

  ionViewDidLoad() {
    console.log('AccountPage::ionViewDidLoad');

    if(this.model.getPairedDevice()) {
      this.modelUpdated();
    }

    this.model.updateObserver().subscribe(() => this.modelUpdated() );
  }

  private modelUpdated() {
    console.log("AccountPage::modelUpdated");
    this._pairedDevice = this.model.getPairedDevice();
  }

  expandItem(item) {
    item.expanded = !item.expanded;
  }

  pairDevice() {
    let myModal = this.modalCtrl.create(ConnectToPage);
    myModal.onDidDismiss(data => {
      console.log(data);
      this.ble.connectTo(data);
     });
    myModal.present();
  }

  goToDevice() {
    this.navCtrl.push(DevicePage);
  }
}
