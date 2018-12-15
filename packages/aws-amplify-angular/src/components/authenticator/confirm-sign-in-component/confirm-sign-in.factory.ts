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
