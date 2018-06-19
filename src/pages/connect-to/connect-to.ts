import { Component, NgZone } from '@angular/core';
import { ViewController, NavController, NavParams, AlertController, Platform } from 'ionic-angular';

import { ModelProvider } from '../../providers/modelprovider';
import { BLEProvider } from '../../providers/bleprovider';

@Component({
  selector: 'page-connect-to',
  templateUrl: 'connect-to.html',
})
export class ConnectToPage {

  constructor(public viewCtrl: ViewController, public navCtrl: NavController, public navParams: NavParams,
              private model: ModelProvider, private ble: BLEProvider,
              public alertCtrl: AlertController,
              public ngZone: NgZone, public plt: Platform) {
  }
  
  enableBluetooth() {
    this.ble.enable();
  }

  attemptConnection(device) {
    console.log("ConnectToPage::attemptConnection: " + device.id);
    this.ble.connectTo(device).subscribe(
      peripheralData => {
        this.connectedTo(device, peripheralData); }
    );
  }

  showPeripheralData(peripheralData) {
    console.log('ConnectToPage::showPeripheralData: ' + peripheralData);
    let alert = this.alertCtrl.create({
      title: 'Connected to ' + peripheralData.id,
      subTitle: 'Pheripheral Data is:',
      message: JSON.stringify(peripheralData),
      buttons: ['OK']
    });
    alert.present();
  }

  /*
  // this is Nordic's UART service
  var bluefruit = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
  };

  public static String GLUCOSE_MEASUREMENT_VALUE = "00002a18-0000-1000-8000-00805f9b34fb";
  public static String GLUCOSE_FEATURE = "00002a51-0000-1000-8000-00805f9b34fb";
  public static String GLUCOSE_CONTROL_POINT = "00002a52-0000-1000-8000-00805f9b34fb";
  public static String CLIENT_CHARACTERISTIC_CONFIG = "00002902-0000-1000-8000-00805f9b34fb";
  public static String GLUCOSE_SERVICE    = "00001808-0000-1000-8000-00805f9b34fb";
  public static String BATTERY_SERVICE    = "0000180f-0000-1000-8000-00805f9b34fb";
  */
  connectedTo(device, peripheralData) {
    console.log("ConnectToPage::connectedTo: " + device.id);
    console.log(peripheralData);

    //this.showPeripheralData(peripheralData);

    this.model.pair(device, peripheralData);

    this.viewCtrl.dismiss(device);
  }

  /*readFromDevice() {
    if(this.connected) {
      this.ngZone.run(() => {
        this.ble.read(this.connectedDevice.id, '1805', '2a53').then(
          (buffer) => { this.onNotifyPress(buffer); }
          );
      });
    }

    setTimeout(() => {
      this.readFromDevice();
    }, 500);


      /* the mbed is programmed for read. How to enable notifications?
      ble.startNotification(this.connectedDevice.id, '1805', '2a53').subscribe(
        (buffer) => { this.onNotifyPress(buffer); },
        (err) => { console.log("Error: " + err); }
      );
      */
  /*}

  disconnect() {
    console.log('disconnect');
    this.ble.disconnect(this.connectedDevice.id).then(() => {
      this.disconnected();
    });
  }

  disconnected() {
    console.log('disconnected');
    this.connected = false;
    let name = this.connectedDevice.name;
    this.connectedDevice = null;
    this.devices.length = 0;
    let alert = this.alertCtrl.create({
      title: 'We got disconnected',
      message: 'Say bye to ' + name,
      buttons: ['OK']
    });
    alert.present();
  }

  onNotifyPress(buffer) {
    let arr = new Uint8Array(buffer);
    console.log("onNotifyPress. arr: " + arr + " " + arr.length);
    //console.log(buffer);// + ' ' + String.fromCharCode.apply(null, arr));
    //console.log(String.fromCharCode.apply(null, arr));
    this.notifications = arr[0];
  }*/

}
