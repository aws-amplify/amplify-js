// tslint:disable
/*
 * Copyright 2017-2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */
// tslint:enable

<<<<<<< HEAD
import {
=======
import { 
>>>>>>> initial commit
  Component,
  Input,
  OnInit,
  ViewChild,
  ComponentFactoryResolver,
  OnDestroy
} from '@angular/core';
import { DynamicComponentDirective } from '../../../directives/dynamic.component.directive';
import { ComponentMount }      from '../../component.mount';
import { ConfirmSignInClass } from './confirm-sign-in.class';
import { ConfirmSignInComponentIonic } from './confirm-sign-in-component.ionic';
import { ConfirmSignInComponentCore } from './confirm-sign-in-component.core';
<<<<<<< HEAD
=======
import { AmplifyUIInterface } from '../../../assets/amplify-angular-theme.class';
>>>>>>> initial commit
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
<<<<<<< HEAD
  @Input() hide: string[] = [];
=======
  @Input() customCSS: AmplifyUIInterface;
  @Input() confirmSignInConfig: any;
>>>>>>> initial commit
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

<<<<<<< HEAD
    const authComponent = this.framework && this.framework.toLowerCase() === 'ionic' ?
    new ComponentMount(ConfirmSignInComponentIonic,{authState: this.authState, hide: this.hide}) :
    new ComponentMount(ConfirmSignInComponentCore, {authState: this.authState, hide: this.hide});
=======
    const data = {
      authState: this.authState,
      confirmSignInConfig: this.confirmSignInConfig,
      customCSS: this.customCSS
    };

    const authComponent = this.framework && this.framework.toLowerCase() === 'ionic' ?
    new ComponentMount(ConfirmSignInComponentIonic, data) :
    new ComponentMount(ConfirmSignInComponentCore, data);
>>>>>>> initial commit

    const componentFactory = this.componentFactoryResolver
    .resolveComponentFactory(authComponent.component);

    const viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (<ConfirmSignInClass>componentRef.instance).data = authComponent.data;
  }
}
