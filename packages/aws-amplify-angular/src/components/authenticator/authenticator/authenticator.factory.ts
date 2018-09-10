import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { AuthClass } from './authenticator.class';
import { AuthenticatorIonicComponent } from './authenticator.component.ionic'
import { AuthenticatorComponentCore } from './authenticator.component.core';

@Component({
  selector: 'amplify-authenticator',
  template: `
              <div class="amplify-component">
                <ng-template component-host></ng-template>
              </div>
            `
})
export class AuthenticatorComponent implements OnInit, OnDestroy {
  @Input() framework: string;
  @Input() hide: string[] = [];
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let authComponent = this.framework && this.framework.toLowerCase() === 'ionic' ? new ComponentMount(AuthenticatorIonicComponent,{hide: this.hide}) : new ComponentMount(AuthenticatorComponentCore, {hide: this.hide});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<AuthClass>componentRef.instance).data = authComponent.data;
  }
}