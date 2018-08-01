import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMountMap } from '../../component.mount';
import { ForgotPasswordClass } from './forgot-password.class';
import { AuthState } from '../../../providers/auth.state';

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
  @Input() authState: AuthState
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let authComponent = this.framework && this.framework.toLowerCase() === 'ionic' ? ComponentMountMap('forgotPasswordIonic',{authState: this.authState}) : ComponentMountMap('forgotPasswordCore', {authState: this.authState});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<ForgotPasswordClass>componentRef.instance).data = authComponent.data;
  }
}
