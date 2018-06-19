import { Component, NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController } from 'ionic-angular';

import { DemoDisplayPage } from '../demodisplay/demodisplay'

import { ModelProvider } from '../../providers/modelprovider';
import { BLEProvider } from '../../providers/bleprovider';

@Component({
  selector: 'page-democonnect',
  templateUrl: 'democonnect.html',
})
export class DemoConnectPage {

  constructor(public navCtrl: NavController, public navParams: NavParams,  public alertCtrl: AlertController, public modalCtrl: ModalController, public ngZone: NgZone,
    private model: ModelProvider, private ble: BLEProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad');
  }

  enableBluetooth() {
  	this.ble.enable();
  }

  scan() {
    this.ble.scan();
  }

  connectTo(device) {
    let alert = this.alertCtrl.create({
      title: 'Connecting to ' + device.id  
    });
    alert.present();

  	console.log("attemptConnection " + device.id);
    this.ble.connectTo(device).subscribe(
      peripheralData => {
        alert.dismiss();
        this.connectedTo(device, peripheralData); },
      error => {
        alert.dismiss();
        let alert2 = this.alertCtrl.create({
          title: 'There was an error' + error,
          buttons: ['OK']
        });
        alert2.present();
      }
    );
  }

  /*
  // this is Nordic's UART service
  var bluefruit = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
  };
  */
  private connectedTo(device, peripheralData) {
    console.log("connectedTo " + device.id);
    console.log(peripheralData);
    // this.showPeripheralData(peripheralData);
    this.model.pair(device, peripheralData);
    this.navCtrl.push(DemoDisplayPage, {deviceid: this.model.getPairedDevice().getId(), data: peripheralData});
  }

  // showPeripheralData(peripheralData) {
  //   console.log('showPeripheralData: ' + peripheralData);
  //   let alert = this.alertCtrl.create({
  //     title: 'Connected to:' + peripheralData.name,
  //     subTitle: 'ID: ' + peripheralData.id,
  //     //message: JSON.stringify(peripheralData),
  //     buttons: ['OK']
  //   });
  //   alert.present();
  //   this.peripheralData = JSON.stringify(peripheralData);
  // }

  // readFromDevice() {
  //   if(this.connected) {
  //     this.ngZone.run(() => {
  //       this.ble.read(this.connectedDevice.id, '1805', '2a53').then(
  //         (buffer) => { this.onNotifyPress(buffer); }
  //         );
  //     });
  //   }

  //   setTimeout(() => {
  //     this.readFromDevice();
  //   }, 500);


  //     /* the mbed is programmed for read. How to enable notifications?
  //     this.ble.startNotification(this.connectedDevice.id, '1805', '2a53').subscribe(
  //       (buffer) => { this.onNotifyPress(buffer); },
  //       (err) => { console.log("Error: " + err); }
  //     );
  //     */
  // }

  // disconnected() {
  //   console.log('disconnected');
  //   this.connected = false;
  //   let name = this.connectedDevice.name;
  //   this.connectedDevice = null;
  //   this.peripheralData = "";
  //   let alert = this.alertCtrl.create({
  //     title: 'We got disconnected',
  //     message: 'Say bye to ' + name,
  //     buttons: ['OK']
  //   });
  //   alert.present();
  // }

  // onNotifyPress(buffer) {
  //   let arr = new Uint8Array(buffer);
  //   console.log("onNotifyPress. arr: " + arr + " " + arr.length);
  //   //console.log(buffer);// + ' ' + String.fromCharCode.apply(null, arr));
  //   //console.log(String.fromCharCode.apply(null, arr));
  //   this.notifications = arr[0];
  // }

}
