import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { ConfirmSignInClass } from './confirm-sign-in.class';
import { ConfirmSignInComponentIonic } from './confirm-sign-in-component.ionic'
import { ConfirmSignInComponentCore } from './confirm-sign-in-component.core';
import { String } from 'aws-sdk/clients/route53domains';
import { AuthState } from '../../../providers';


@Component({
  selector: 'amplify-auth-confirm-sign-in',
  template: `
              <div>
                <ng-template component-host></ng-template>
              </div>
            `
})
export class ConfirmSignInComponent implements OnInit, OnDestroy {
  @Input() framework: String;
  @Input() authState: AuthState;
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let authComponent = this.framework && this.framework.toLowerCase() === 'ionic' ? new ComponentMount(ConfirmSignInComponentIonic,{authState: this.authState}) : new ComponentMount(ConfirmSignInComponentCore, {authState: this.authState});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<ConfirmSignInClass>componentRef.instance).data = authComponent.data;
  }
}
