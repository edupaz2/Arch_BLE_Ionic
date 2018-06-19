import { Component } from '@angular/core';

import { HomePage } from '../home/home';
import { StatsPage } from '../stats/stats';
import { LogPage } from '../log/log';
import { AccountPage } from '../account/account';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})

export class TabsPage {

  homeRoot = HomePage;
  //statsRoot = StatsPage;
  logRoot = LogPage;
  accountRoot = AccountPage;

  constructor() {}

}
