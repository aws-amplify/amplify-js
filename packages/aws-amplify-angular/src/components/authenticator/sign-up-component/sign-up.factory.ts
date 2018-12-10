import { 
  Component,
  Input,
  OnInit,
  ViewChild,
  ComponentFactoryResolver,
  OnDestroy 
} from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { SignUpClass } from './sign-up.class';
import { SignUpComponentIonic } from './sign-up.component.ionic';
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
  @Input() signUpConfig: any;
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    const authComponent = this.framework && this.framework.toLowerCase() === 'ionic' ?
    new ComponentMount(SignUpComponentIonic, {
      authState: this.authState,
      signUpConfig: this.signUpConfig
    }) :
    new ComponentMount(SignUpComponentCore, {
      authState: this.authState,
      signUpConfig: this.signUpConfig
    });

    const componentFactory = this.componentFactoryResolver
    .resolveComponentFactory(authComponent.component);

    const viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (<SignUpClass>componentRef.instance).data = authComponent.data;
  }
}
