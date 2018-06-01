import { Component, OnInit } from '@angular/core';

import { AdService }         from '../../providers/ad.service';
import { AdItem }            from './ad-item';

import { AuthenticatorComponent } from './authenticator.component'
import {HeroProfileComponent} from './hero-profile.component';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <app-ad-banner [ads]="ads"></app-ad-banner>
    </div>
  `
})
export class AppComponent implements OnInit {
  ads: AdItem[];

  constructor(private adService: AdService) {}

  ngOnInit() {
    this.ads = [new AdItem(HeroProfileComponent, {name: 'Bombasto', bio: 'Brave as they come'}),]
  }
}

