import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { SignUpClass } from './sign-up.class';
import { SignUpComponentIonic } from './sign-up.component.ionic'
import { SignUpComponentCore } from './sign-up.component.core';

@Component({
  selector: 'amplify-auth-sign-up',
  template: `
              <div>
                <ng-template component-host></ng-template>
              </div>
            `
})
export class SignUpComponent implements OnInit, OnDestroy {
  @Input() ionic: boolean
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let authComponent = this.ionic ? new ComponentMount(SignUpComponentIonic,{authState: ''}) : new ComponentMount(SignUpComponentCore, {authState: ''});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<SignUpClass>componentRef.instance).data = authComponent.data;
  }
}

