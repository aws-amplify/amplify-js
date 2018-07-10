import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { SignUpClass } from './sign-up.class';
import { SignUpComponentIonic } from './sign-up.component.ionic'
import { SignUpComponentCore } from './sign-up.component.core';
import { AuthState } from '../../../providers';

@Component({
  selector: 'amplify-auth-sign-up',
  template: `
              <div>
                <ng-template component-host></ng-template>
              </div>
            `
})
export class SignUpComponent implements OnInit, OnDestroy {
  @Input() framework: string;
  @Input() authState: AuthState;
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let authComponent = this.framework && this.framework.toLowerCase() === 'ionic' ? new ComponentMount(SignUpComponentIonic,{authState: this.authState}) : new ComponentMount(SignUpComponentCore, {authState: this.authState});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<SignUpClass>componentRef.instance).data = authComponent.data;
  }
}
