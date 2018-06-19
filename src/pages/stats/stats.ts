import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Chart } from 'chart.js';

import { ModelProvider } from '../../providers/modelprovider';
import { EPGDevice } from '../../models/epgdevice';

@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html',
})
export class StatsPage {

  @ViewChild('lineCanvas') lineCanvas;
  lineChart: any;

  private _pairedDevice: EPGDevice = null;

  private _section: number = 1;
  private _dates: Date[] = [];
  private _doses: number[] = [];

  constructor(public navCtrl: NavController,
              private model: ModelProvider) {
  }

  ngAfterViewInit() {
  //ionViewDidLoad() {
    console.log('ionViewDidLoad StatsPage');

    this.lineChart = new Chart(this.lineCanvas.nativeElement, {

      type: 'line',
      data: {
        labels: this._dates,
        datasets: [
        {
          label: 'Daily Insulin Dosage',
          fill: true,
          lineTension: 0.1,
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: 'rgba(75,192,192,1)',
          pointBackgroundColor: '#fff',
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: 'rgba(75,192,192,1)',
          pointHoverBorderColor: 'rgba(220,220,220,1)',
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: [],
          spanGaps: false,
        },
        ]
      },
      options: {
        responsive: false,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            type: 'linear',
          }],
          xAxes: [{
            type: 'time',
            time: {
              displayFormats: {
                quarter: 'h:mm a'
              }
            }
          }]
        }
      }
    });

    if(this.model.getPairedDevice()) {
      this.modelUpdated();
    }

    this.model.updateObserver().subscribe(() => this.modelUpdated() );
  }

  private modelUpdated() {
    this._pairedDevice = this.model.getPairedDevice();
    this._dates = this._pairedDevice.getDates();
    this._doses = this._pairedDevice.getDoses();
    console.log("StatsPage::modelUpdated - Dates");
    console.log(this._dates);
    console.log("StatsPage::modelUpdated - Doses");
    console.log(this._doses);

    this.lineChart.data.labels.pop();
    this.lineChart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });

    for (let i = 0; i < this.lineChart.data.labels.length; i++) {
      this.lineChart.data.labels.pop();
      this.lineChart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
      });
    }

    for (let i = 0; i < this._dates.length; i++) {
      this.lineChart.data.labels.push(this._dates[i]);
      this.lineChart.data.datasets.forEach((dataset) => {
          dataset.data.push(this._doses[i]);
      });
    }
    
    this.lineChart.update();
  }

  private addData(label, data) {
      this.lineChart.data.labels.push(label);
      this.lineChart.data.datasets.forEach((dataset) => {
          dataset.data.push(data);
      });
      this.lineChart.update();
  }

  private removeData() {
    this.lineChart.data.labels.pop();
    this.lineChart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });

    this.lineChart.data.labels.pop();
    this.lineChart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
  }

  private daily() {
    this._section = 1;

    this.lineChart.data.datasets[0].label = 'Daily Insulin Dosage';
    this.lineChart.options.scales.xAxes[0].time.displayFormats.quarter = 'h:mm';

    this.lineChart.update();
  }

  private weekly() {
    this._section = 2;

    this.lineChart.data.datasets[0].label = 'Weekly Insulin Dosage';
    this.lineChart.options.scales.xAxes[0].time.displayFormats.quarter = 'MMM D';
    this.lineChart.update();
  }

  private monthly() {
    this._section = 3;

    this.lineChart.data.datasets[0].label = 'Monthly Insulin Dosage';
    this.lineChart.options.scales.xAxes[0].time.displayFormats.quarter = 'MMM YYYY';
    this.lineChart.update();
  }

  private yearly() {
    this._section = 4;

    this.lineChart.data.datasets[0].label = 'Yearly Insulin Dosage';
    this.lineChart.options.scales.xAxes[0].time.displayFormats.quarter = 'YYYY';
    this.lineChart.update();
  }

}
