import { Component } from '@angular/core';
import { ViewController , NavParams } from 'ionic-angular';

import { BLE } from '@ionic-native/ble';

@Component({
  selector: 'page-connect-modal',
  templateUrl: 'connect-modal.html',
})
export class ConnectModalPage {

	private devices: any = [];
  private scanning: boolean = false;
  private scanIters: number = 0;
  private notifications: number = 0;
  private actionBtLbl: string;

  //static singleton: ConnectModalPage;

  constructor(public viewCtrl: ViewController, public navParams: NavParams, private ble: BLE) {
  	//ConnectModalPage.singleton = this;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConnectModalPage');

    this.scan();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  scan() {
    this.scanning = true;
    this.actionBtLbl = "Stop";
    console.log("Scanning");

    this.devices.length = 0;
    this.scanIters = 0;
    this.notifications = 0;

    this.ble.startScan([]).subscribe(
      (device) => { this.deviceDiscovered(device); },
      (err) => { this.errorWhileScanning() }
    );
    /*ble.startScan([],
    	function(device) {
	    	ConnectModalPage.singleton.deviceDiscovered(device);
			},
			function(error) {
	    	ConnectModalPage.singleton.errorWhileScanning();
			}
		);*/

    setTimeout(() => {
      this.scanIter();
    }, 500);
  }

  scanIter() {
    this.scanIters++;
    if(this.scanIters < 10) {
      setTimeout(() => {
        this.scanIter();
      }, 500);
    } else {
      this.stopScan();
    }
  }

  stopScan() {
    this.ble.stopScan();
    this.scanning = false;
    this.actionBtLbl = "Scan";
    console.log("Finished");
  }

  deviceDiscovered(device) {
    if (this.devices.indexOf(device) == -1) {
      this.devices.push(device);
      console.log("Device " + JSON.stringify(device));
      console.log(device);
    }
  }

  errorWhileScanning() {
    this.scanning = false;
    this.actionBtLbl = "Scan";
    console.log("Error");
  }

  actionBtClick() {
  	if(!this.scanning) {
  		this.scan();
  	}
  }

  attemptConnection(device) {
    console.log("attemptConnection " + device.id);
    this.viewCtrl.dismiss(device);
  }

}
