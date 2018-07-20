import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { SignInClass } from './sign-in.class';
import { SignInComponentIonic } from './sign-in.component.ionic'
import { SignInComponentCore } from './sign-in.component.core';
import { AuthState } from '../../../providers';
import { authDecorator } from '../../../providers/auth.decorator';

@Component({
  selector: 'amplify-auth-sign-in',
  template: `
              <div>
                <ng-template component-host></ng-template>
              </div>
            `
})
export class SignInComponent implements OnInit, OnDestroy {
  @Input() framework: string;
  @Input() authState: AuthState;
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let authComponent = this.framework && this.framework === 'ionic' ? new ComponentMount(SignInComponentIonic,{authState: this.authState}) : new ComponentMount(SignInComponentCore, {authState: this.authState});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<SignInClass>componentRef.instance).data = authComponent.data;
  }
}
