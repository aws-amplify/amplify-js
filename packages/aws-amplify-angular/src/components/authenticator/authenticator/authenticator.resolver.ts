import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { AuthInterface } from './authenticator.interface';
import {AuthenticatorIonicComponent} from './authenticator.component.ionic'
import { AuthenticatorComponentCore } from '.';

@Component({
  selector: 'amplify-authenticator',
  template: `
              <div class="ad-banner">
                <h3>Component Mounting Test</h3>
                <ng-template component-host></ng-template>
              </div>
            `
})
export class AuthenticatorComponent implements OnInit, OnDestroy {
  @Input() ionic: boolean
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;
  interval: any;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
    // this.getAds();
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  loadComponent() {

    let authComponent = this.ionic ? new ComponentMount(AuthenticatorIonicComponent,{}) : new ComponentMount(AuthenticatorComponentCore, {});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<AuthInterface>componentRef.instance).data = authComponent.data;
  }
}


