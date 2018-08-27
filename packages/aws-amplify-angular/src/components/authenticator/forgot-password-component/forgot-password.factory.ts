import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { ForgotPasswordClass } from './forgot-password.class';
import { ForgotPasswordComponentIonic } from './forgot-password.component.ionic';
import { ForgotPasswordComponentCore } from './forgot-password.component.core';
import { AuthState } from '../../../providers';

@Component({
  selector: 'amplify-auth-forgot-password',
  template: `
              <div>
                <ng-template component-host></ng-template>
              </div>
            `
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  @Input() framework: string;
  @Input() authState: AuthState;
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    const authComponent = this.framework && this.framework.toLowerCase() === 'ionic' ?
    new ComponentMount(ForgotPasswordComponentIonic,{authState: this.authState}) :
    new ComponentMount(ForgotPasswordComponentCore, {authState: this.authState});

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);

    const viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (<ForgotPasswordClass>componentRef.instance).data = authComponent.data;
  }
}
