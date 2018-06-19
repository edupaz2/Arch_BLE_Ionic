import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Storage } from '@ionic/storage';

import { BLEProvider } from './bleprovider';
import { EPGDevice } from '../models/epgdevice';

@Injectable()
export class ModelProvider {

  // This class will manage the data of the app.
  // It will have two data sources:
  // 1. The Bleprovider, with data from the epg.
  // 2. The Storage, with old data already stored in the phone.
  // Everytime the BleProvider syncs with the epg, the data
  // will be transfered to the DataProvider.

  /*
  Suggestions: ask the device injections from the last id. If we request 0, it should give us all injections it has. If we have id==n, then we ask for n+1.
  */

  // Ionic uses ISO 8601 Datetime Format: YYYY-MM-DDTHH:mmZ
  private _devices: EPGDevice[] = []; // List of EPGDevices

  private _pairedDevice: EPGDevice = null; // id of the last active device
  private _peripheralData: any = null;

  private updateObservables: any = [];
  private updateObservers: any = []; 

  constructor(private _storage: Storage, private ble: BLEProvider) {
    console.log('Hello ModelProvider Provider');

    // TODO:
    // 1. Load from storage previous paired device, and load its data.
    // 2. Notify model updated.
    // 3. Sync it? Where to call it? if ble not enabled?
  }

  public updateObserver(): Observable<boolean> {
    let updateObservable = Observable.create(
      observer => {
        let updateObserver = observer;

        this.updateObservables.push(updateObservable);
        this.updateObservers.push(updateObserver);
      }
    );
    return updateObservable;
  }

  private notifyObservers() {
    for(let i = 0; i < this.updateObservers.length; i++) {
      this.updateObservers[i].next(true);
    }
  }

  public getPairedDevice(): EPGDevice {
    return this._pairedDevice;
  }

  public getPeripheralData() {
    return this._peripheralData;
  }

  public pair(device, peripheralData) {
    if(device != this._pairedDevice) {
      let epg:EPGDevice = null;
      for(let i = 0; i < this._devices.length; ++i) {
        if (this._devices[i].getId() == device.id) {
          epg = this._devices[i];
        }
      }
      if(epg == null) {
        epg = new EPGDevice(peripheralData);
        this._devices.push(epg);
      }
      this._pairedDevice = epg;
      this._peripheralData = peripheralData;
    }

    this.syncData();
  }

  public syncData() {
    if(this._pairedDevice != null) {
      this._syncFromPairedDevice();
    }
  }

  public unpair() {
    this._pairedDevice = null;

    this.notifyObservers();
  }

  private nrf_uart_serviceUUID: string = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  private nrf_uart_txCharacteristic: string = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // transmit from the phone's perspective
  private nrf_uart_rxCharacteristic: string = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';  // receive from the phone's perspective

  /// 6E400001-B5A3-F393-E0A9-E50E24DCCA9E for the Service
  /// 6E400003-B5A3-F393-E0A9-E50E24DCCA9E for the TX Characteristic Property = Notify
  /// 6E400002-B5A3-F393-E0A9-E50E24DCCA9E for the RX Characteristic Property = Write without response

  private _syncFromPairedDevice() {
    console.log("ModelProvider::_syncFromPairedDevice: Start");

    /// CODE FOR DEMO WITH ERIC
    this.ble.startNotification(this._pairedDevice.getId(), this.nrf_uart_serviceUUID, this.nrf_uart_rxCharacteristic).subscribe(
      data => {
        let parsedData = new Uint8Array(data);
        let res = "";
        for(let i = 0; i < parsedData.length; ++i) {
          if (parsedData[i] != 0) {
            let c = String.fromCharCode(parsedData[i]);
            res = res + c;
          }
        }
        console.log('ModelProvider::_syncFromPairedDevice. "' + res + '" received');
        console.log("ModelProvider::_syncFromPairedDevice. Notification received from " + this.nrf_uart_rxCharacteristic + ", value: (0x) " + parsedData[0].toString(16) + "-" + parsedData[1].toString(16) + "-00-00");

        let dose = Number(res)/10.0;
        let date = Date.now();

        this._pairedDevice.addInjection(date, dose);

        this.notifyObservers();
      },
      () => console.log("ModelProvider::_syncFromPairedDevice. Unexpected Error: Failed to subscribe for button state changes")
    );// ble.startNotification

    /// END CODE FOR DEMO WITH ERIC
    
    /*this.ble.read(this._pairedDevice.getId(), "77FF", "AE30").then(
        (data) => {
          this._pairedDevice.clearInjections();

          let parsedData = new Uint8Array(data);// Improve to uint32?
          console.log("ModelProvider::_syncFromPairedDevice " + parsedData.length + " B read.");
          for(let i = 0; i < parsedData.length; ++i) { // being INJECTIONSSIZE=10
            console.log(parsedData[i].toString(16));
          }
          this._pairedDevice.setBatteryLevel(parsedData[0]);
          this._pairedDevice.setDose(parsedData[1]);
          this._pairedDevice.setErrors(parsedData[2]);
          this._pairedDevice.setWarnings(parsedData[3]);

          // Refactor and optimize these 3 loops
          let size = 12; // INJECTIONSSIZE
          let dates: number[] = [];
          for(let i = 0, offset = 4; i < size; ++i) {
            let idx = offset+i*4;// 4B struct
            let epoch: number = parsedData[idx] + (parsedData[idx+1]<<8) + (parsedData[idx+2]<<16) + (parsedData[idx+3]<<24);
            let date = new Date(epoch*1000);
            dates.push(date);
          }
          let doses: number[] = [];
          for(let i = 0, offset = 4+4*size; i < size; ++i) {
            doses.push(0.1 * parsedData[offset+i]); // 0.1 to include the decimal
            doses.push(0.1 * parsedData[offset+i+1]);
            doses.push(0.1 * parsedData[offset+i+2]);
            doses.push(0.1 * parsedData[offset+i+3]);
          }
          for(let i = 0; i < size; ++i) {
            if(dates[i] != 0) {
              this._pairedDevice.addInjection(dates[i], doses[i]);
            }
          }
        
          this.notifyObservers();
        });*/
  }

  // private getFromStorage(key: string): any {
  //   return this._storage.get(key);
  // }

  // private saveToStorage(key, data): void {
  //   let newData = JSON.stringify(data);
  //   this._storage.set(key, newData);
  // }
}
