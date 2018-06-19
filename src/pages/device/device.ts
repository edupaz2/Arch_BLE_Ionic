import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ModelProvider } from '../../providers/modelprovider';
import { EPGDevice } from '../../models/epgdevice';

@Component({
  selector: 'page-device',
  templateUrl: 'device.html',
})
export class DevicePage {

  private _pairedDevice: EPGDevice = null;
  
  constructor(public navCtrl: NavController, public navParams: NavParams,
              private model: ModelProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DevicePage');

    if(this.model.getPairedDevice()) {
      this.modelUpdated();
    }

    this.model.updateObserver().subscribe(() => this.modelUpdated() );
  }

  private modelUpdated() {
    this._pairedDevice = this.model.getPairedDevice();
  }

}
