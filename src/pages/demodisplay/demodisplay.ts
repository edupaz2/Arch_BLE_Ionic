import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { BLEProvider } from '../../providers/bleprovider';

@Component({
  selector: 'page-demo-display',
  templateUrl: 'demodisplay.html',
})
export class DemoDisplayPage {

  @ViewChild('write') writeinput: any;

  private _deviceId: any;
  private _peripheralData: any;
  //private _towrite: any[] = [];
  private _toread: any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private _ble: BLEProvider) {
    this._deviceId = navParams.get("deviceid");
    this._peripheralData = navParams.get("data");
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DemoDisplayPage');

    let chars = this._peripheralData.characteristics;
    for(let i in chars) {
      let item = chars[i];
      for(let prop of item.properties) {
        if(prop == "Read") {
          this._ble.read(this._deviceId, item.service, item.characteristic)
            .then(
              data => {
                this._toread[i] = this._ble.bytesToString(data);
              }
            );
        }
      }
    }
  }

  /*private write(characteristic: any, service: any, index: any) {
    let data = new Uint32Array(1);
    data[0] = this._towrite[index];
    this._ble.write(this._deviceId, service, characteristic, data.buffer)
      .then(
        data => {
          console.log("Data written " + this._towrite[index]);
        }
      )
      .catch(
        err => {
          console.log("Error while writing " + err);
        }
      );
  }

  private read(characteristic: any, service: any) {
    this._ble.read(this._deviceId, service, characteristic)
      .then(
        data => {
          return data;
        }
      );
  }*/
}
