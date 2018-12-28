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
import { AuthClass } from './authenticator.class';
import { AuthenticatorIonicComponent } from './authenticator.component.ionic'
import { AuthenticatorComponentCore } from './authenticator.component.core';

@Component({
  selector: 'amplify-authenticator',
  template: `
              <div class="amplify-component">
                <ng-template component-host></ng-template>
              </div>
            `
})
export class AuthenticatorComponent implements OnInit, OnDestroy {
  @Input() framework: string;
  @Input() hide: string[] = [];
  @Input() signUpConfig: any;
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let authComponent = this.framework && this.framework.toLowerCase() === 'ionic' ? new ComponentMount(AuthenticatorIonicComponent,{hide: this.hide, signUpConfig: this.signUpConfig}) : new ComponentMount(AuthenticatorComponentCore, {hide: this.hide, signUpConfig: this.signUpConfig});

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);

    let viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<AuthClass>componentRef.instance).data = authComponent.data;
  }
}