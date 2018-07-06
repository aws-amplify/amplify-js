import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { GreetingClass } from './greeting.class';
import { GreetingComponentIonic } from './greeting.component.ionic'
import { GreetingComponentCore } from './greeting.component.core';
import { AuthState } from '../../../providers';

@Component({
  selector: 'amplify-auth-greetings',
  template: `
              <div>
                <ng-template component-host></ng-template>
              </div>
            `
})
export class GreetingComponent implements OnInit, OnDestroy {
  @Input() framework: string;
  @Input() authState: AuthState;
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let authComponent = this.framework && this.framework.toLowerCase() === 'ionic' ? new ComponentMount(GreetingComponentIonic,{authState: this.authState}) : new ComponentMount(GreetingComponentCore, {authState: this.authState});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<GreetingClass>componentRef.instance).data = authComponent.data;
  }
}
