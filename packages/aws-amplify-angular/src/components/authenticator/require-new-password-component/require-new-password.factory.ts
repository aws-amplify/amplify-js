import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { RequireNewPasswordClass } from './require-new-password.class';
import { RequireNewPasswordComponentIonic } from './require-new-password.component.ionic'
import { RequireNewPasswordComponentCore } from './require-new-password.component.core';
import { AuthState } from '../../../providers';

@Component({
  selector: 'amplify-auth-require-new-password',
  template: `
              <div>
                <ng-template component-host></ng-template>
              </div>
            `
})
export class RequireNewPasswordComponent implements OnInit, OnDestroy {
  @Input() framework: string;
  @Input() authState: AuthState;
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let requireNewPasswordComponent = this.framework && this.framework.toLowerCase() === 'ionic' ? new ComponentMount(RequireNewPasswordComponentIonic,{authState: this.authState}) : new ComponentMount(RequireNewPasswordComponentCore, {authState: this.authState});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(requireNewPasswordComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<RequireNewPasswordClass>componentRef.instance).data = requireNewPasswordComponent.data;
  }
}
