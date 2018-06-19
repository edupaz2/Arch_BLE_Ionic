import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Platform } from 'ionic-angular';
import { BLE } from '@ionic-native/ble';


/**
     * Write the value of a characteristic.
     * @usage
     * ```
     * // send 1 byte to switch a light on
     * var data = new Uint8Array(1);
     * data[0] = 1;
     * BLE.write(device_id, 'FF10', 'FF11', data.buffer);
     *
     * // send a 3 byte value with RGB color
     * var data = new Uint8Array(3);
     * data[0] = 0xFF;  // red
     * data[0] = 0x00; // green
     * data[0] = 0xFF; // blue
     * BLE.write(device_id, 'ccc0', 'ccc1', data.buffer);
     *
     * // send a 32 bit integer
     * var data = new Uint32Array(1);
     * data[0] = counterInput.value;
     * BLE.write(device_id, SERVICE, CHARACTERISTIC, data.buffer);
     *
     * ```
     * @param {string} deviceId  UUID or MAC address of the peripheral
     * @param {string} serviceUUID  UUID of the BLE service
     * @param {string} characteristicUUID  UUID of the BLE characteristic
     * @param {ArrayBuffer} value  Data to write to the characteristic, as an ArrayBuffer.
     * @return Returns a Promise
     */

@Injectable()
export class BLEProvider {

  private _ble: any;
  private _enabled: boolean;
  private _connected: boolean;

  private _pairedDevice: any = null; // TODO Move to Model
  private _scanDevices: any[] = [];
  private _scanIters: number = 0;

  private connectionObservable: any;
  private connectionObserver: any;

  constructor(public cordovaBLE: BLE, private _plt: Platform) {
    if(this._plt.is("cordova")) {
      this._ble = cordovaBLE;
    } else {
      this._ble = new FakeBLE();
    }

    this.checkBluetoothEnabled();

    this.connectionObservable = Observable.create(observer => {
      this.connectionObserver = observer;
    });
  }

  public enabled(): boolean {
    return this._enabled;
  }

  public connected(): boolean {
    return this._connected;
  }

  public getScanDevices(): any[] {
    return this._scanDevices;
  }

  public enable() {
    this._ble.enable()
      .then(
        (data) => {
          console.log("Bluetooth has been enabled");
          this._enabled = true;
        }
      )
      .catch(
        (err) => {
          console.log("Bluetooth was not enabled");
          this._enabled = false;
      });
  }

  public scan() {
    console.log("Scanning started");

    this._scanDevices.length = 0;
    this._scanIters = 0;

    // (services)  string[]  List of service UUIDs to discover, or [] to find all devices
    this._ble.startScan([]).subscribe(
      (device) => { this.deviceDiscovered(device); },
      (err) => { this.errorWhileScanning() }
    );

    setTimeout(() => {
      this.scanIter();
    }, 500);
  }

  private scanIter() {
    this._scanIters++;
    if(this._scanIters < 10) {
      setTimeout(() => {
        this.scanIter();
      }, 500);
    } else {
      this.stopScan();
    }
  }

  private stopScan() {
    this._ble.stopScan();
    console.log("Scanning finished");
  }

  private deviceDiscovered(device) {
    if (this._scanDevices.indexOf(device) == -1) {
      this._scanDevices.push(device);
      console.log("BLE::deviceDiscovered : " + JSON.stringify(device));
    }
  }

  private errorWhileScanning() {
    this._scanIters = 10;
    console.log("Error");
  }

  private checkBluetoothEnabled() {
    this._ble.isEnabled()
      .then(
        data => {
          this._enabled = true;
        }
      )
      .catch(
        (err) => {
          this._enabled = false;
      });

    // The ble.enable Promise is not working.
    setTimeout(() => {
      this.checkBluetoothEnabled();
    }, 5000);
  }

  private checkConnection() {
    this._ble.isConnected(this._pairedDevice.id)
      .then(
        data => {
          if(!this._connected) {
            console.log("Connected to paired device");
            this._connected = true;
          }
          // The ble.enable Promise is not working.
          setTimeout(() => {
            this.checkConnection();
          }, 60000);// 1 min
        }
      )
      .catch(
        err => {
          console.log("Not connected to paired device");
          this._connected = false;
          //this.connect(this._pairedDevice);// Reconnect
        }
    );
  }

  public connectTo(device): Observable<any> {
    // make the device the default one.
    // if not, clean the previous data?
    // grab it's data.
    // keep the connection alive.

    // The ble.enable Promise is not working.
    this._pairedDevice = device;
    setTimeout(() => {
      this.attemptConnection(device);
    }, 500);// Is this necessary? I want it for the return to happen before the connect

    return this.connectionObservable;
  }

  private attemptConnection(device) {
    this._ble.connect(device.id).subscribe(
      data => {
        console.log('BLEProvider::attemptConnection: next');
        this.connectionObserver.next(data);
        this._connected = true;
        //this.checkConnection();
      },
      e => {
        console.log('BLEProvider::attemptConnection: error');
        this._connected = false;
      },
      () => {
        console.log('BLEProvider::attemptConnection: completed');
      }
    );
  }

  public disconnect(): Observable<any> {
    console.log('BLEProvider::disconnect');
    this._ble.disconnect(this._pairedDevice.id).then(() => {
      this.disconnected();
    });

    return this.connectionObservable;
  }

  private disconnected() {
    console.log('BLEProvider::disconnected');
    this._connected = false;
    let oldPairedDevice = this._pairedDevice;
    this._pairedDevice = null;
    this.connectionObserver.next(oldPairedDevice);
  }

  /*public syncModel(): Promise<any> {
    console.log("BLE::syncModel : starting sync");
    return new Promise(resolve => {
      console.log("BLE::syncModel : before read");
      this.read(this._pairedDevice.id, "77FF", "AE33").then(
        (data) => {
          let parseData = new Uint8Array(data);
          console.log("BLE::syncModel OK: bytes=" + parseData.length);
          console.log(JSON.stringify(this.bytesToString(data)));
          //console.log(this.bytesToString(data));
          console.log(data); // ArrayBuffer
          resolve(this.bytesToString(data));
        },
        (err) => {
          console.log("BLE::syncModel ERROR: " + err);
          resolve(err); // TODO devolver error
        }
        );
    });
  }*/

  // ASCII only
  stringToBytes(string) {
   let array = new Uint8Array(string.length);
   for (let i = 0, l = string.length; i < l; i++) {
       array[i] = string.charCodeAt(i);
    }
    return array.buffer;
  }

  // ASCII only
  bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
  }

  read(deviceId: string, serviceUUID: string, characteristicUUID: string): Promise<any> {
    return this._ble.read(deviceId, serviceUUID, characteristicUUID);
  }

  write(deviceId: string, serviceUUID: string, characteristicUUID: string, value: ArrayBuffer): Promise<any> {
    return this._ble.write(deviceId, serviceUUID, characteristicUUID, value);
  }

  writeWithoutResponse(deviceId: string, serviceUUID: string, characteristicUUID: string, value: ArrayBuffer): Promise<any> {
    return this._ble.writeWithoutResponse(deviceId, serviceUUID, characteristicUUID, value);
  }

  startNotification(deviceId: string, serviceUUID: string, characteristicUUID: string): Observable<any> {
    return this._ble.startNotification(deviceId, serviceUUID, characteristicUUID);
  }
}

class FakeBLE {

  private scanDevices: any[] = [];
  private scanDevicesObservable: any;
  private scanDevicesObserver: any;

  private connectionObservable: Observable<string>;
  private connectionObserver: any;

  constructor() {

    this.scanDevices.push({name: 'Dummy EPG', id: 'AA:BB:CC:DD:EE:FF', rssi: '-80'});
    //this.scanDevices.push({name: 'My FakeBLE2', id: '00:11:22:33:44:55', rssi: '-80'});

    this.scanDevicesObservable = Observable.create(observer => {
      this.scanDevicesObserver = observer;
    });

    this.connectionObservable = Observable.create(observer => {
      this.connectionObserver = observer;
    });
  }

  public enable(): Promise<boolean> {
    return new Promise(resolve => {
      resolve(true);
    });
  }

  public isEnabled(): Promise<boolean> {
    return new Promise(resolve => {
      resolve(true);
    });
  }

  public isConnected(): Promise<any> {
    return new Promise(resolve => {
      resolve(true);
    });
  }

  // Returns device
  public startScan(options:any[]): Observable<any> {
    setTimeout(() => {
      for (let i = 0; i < this.scanDevices.length; i++) {
        this.scanDevicesObserver.next(this.scanDevices[i]);
      }
    }, 100);
    
    return this.scanDevicesObservable;
  }

  stopScan() {}

  // Returns pheripheralData
  public connect(id: string): Observable<string> {
    setTimeout(() => {
      let mydata = {
        id: "AA:BB:CC:DD:EE:FF",
        name: "Dummy EPG",
        rssi: -66,
        characteristics:[
          {characteristic:"AE30", service:"77FF", properties: ["Read","Write"]},
          /*{characteristic:"2a01", service:"1800", properties: ["Read"]},
          {characteristic:"2a04", service:"1800", properties: ["Read"]},
          {characteristic:"fec8", service:"fee7", properties: ["Indicate"]},
          {characteristic:"fec7", service:"fee7", properties: ["Write"]},
          {characteristic:"fec9", service:"fee7", properties: ["Read"]},
          {characteristic:"fcc7", service:"fcc0", properties: ["Indicate"]},
          {characteristic:"fcc6", service:"fcc0", properties: ["Write"]},
          {characteristic:"fcc8", service:"fcc0", properties: ["Read"]},
          {characteristic:"a501", service:"a500", properties: ["Indicate"]},
          {characteristic:"a502", service:"a500", properties: ["Write"]},
          {characteristic:"a503", service:"a500", properties: ["Notify"]},
          {characteristic:"2a29", service:"180a", properties: ["Read"]},
          {characteristic:"2a24", service:"180a", properties: ["Read"]},
          {characteristic:"2a25", service:"180a", properties: ["Read"]},
          {characteristic:"2a27", service:"180a", properties: ["Read"]},
          {characteristic:"2a26", service:"180a", properties: ["Read"]},
          {characteristic:"2a23", service:"180a", properties: ["Read"]},*/
        ],
        services: [
          "77FF"//, "1801", "fee7", "fcc0", "a500", "180a"
        ]
      };
      this.connectionObserver.next(mydata);
    }, 500);
    return this.connectionObservable;
  }

  // Returns pheripheralData
  public disconnect(id: string): Promise<any> {
    return new Promise(resolve => { resolve(""); });
  }

  read(deviceId: string, serviceUUID: string, characteristicUUID: string): Promise<any> {
    return new Promise(resolve => { resolve(this._dummyData()); });
  }

  write(deviceId: string, serviceUUID: string, characteristicUUID: string, value: ArrayBuffer): Promise<any> {
    return new Promise(resolve => {
      resolve("data");
    });
  }

  writeWithoutResponse(deviceId: string, serviceUUID: string, characteristicUUID: string, value: ArrayBuffer): Promise<any> {
    return new Promise(resolve => {
      resolve("data");
    });
  }

  private _dummyData(): any {
    let arr: number[] = [0x5,0x5,0x5,0x5,0x25,0x80,0x2f,0x5a,0xa5,0xd1,0x30,0x5a,0x25,0x23,0x32,0x5a,0xa5,0x74,0x33,0x5a,0x25,0xc6,0x34,0x5a,0xa5,0x17,0x36,0x5a,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0x0,0xa,0xb,0xc,0xd,0xe,0xf,0x0,0x0,0x0,0x0,0x0,0x0];
    return new Uint8Array(arr);
  }

  /*private _dummyData(): any {
    return {
        id: "AA:BB:CC:DD:EE:FF",
        name: "Dummy EPG",
        injections: [
          { date: "2018-01-01 13:47:20",
            units: 5.0 },
          { date: "2018-01-02 13:47:20",
            units: 5.1 },
          { date: "2018-01-03 13:47:20",
            units: 5.2 },
          { date: "2018-01-04 13:47:20",
            units: 5.3 },
          { date: "2018-01-05 13:47:20",
            units: 5.4 },
          { date: "2018-01-06 13:47:20",
            units: 5.5 },
          { date: "2018-01-07 13:47:20",
            units: 6 },
          { date: "2018-01-08 13:47:20",
            units: 6.1 },
          { date: "2018-01-09 13:47:20",
            units: 6.2 },
        ],
        replacements: [ // When the replacements were done
          "2018-01-01T13:47:20.789+5:00",
          "2018-01-05T13:47:20.789+5:00",
          "2018-01-09T13:47:20.789+5:00",
        ],
        status: {
          battery: 55,
          current_dose: 5.0,
          warnings: [
            "This is a warning",
          ],
          errors: [
            "This is an error",
          ]
        },
      };
  }*/

}
