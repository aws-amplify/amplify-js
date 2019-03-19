// tslint:disable
/*
 * Copyright 2017-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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
import { DynamicComponentDirective } from '../../../../directives/dynamic.component.directive';
import { ComponentMount } from '../../../component.mount';
import { AmazonSignInClass } from './amazon-sign-in.class';
import { AmazonSignInComponentIonic } from './amazon-sign-in.component.ionic'
import { AmazonSignInComponentCore } from './amazon-sign-in.component.core';

@Component({
  selector: 'amplify-auth-amazon-sign-in',
  template: `
              <div>
                <ng-template component-host></ng-template>
              </div>
            `
})
export class AmazonSignInComponent implements OnInit, OnDestroy {
  @Input() framework: string;
  @Input() amazonClientId: string;
  @ViewChild(DynamicComponentDirective) componentHost: DynamicComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {}

  loadComponent() {

    let authComponent = this.framework && this.framework === 'ionic' 
      ? new ComponentMount(AmazonSignInComponentIonic, { amazonClientId: this.amazonClientId }) 
      : new ComponentMount(AmazonSignInComponentCore, { amazonClientId: this.amazonClientId });

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(authComponent.component);

    const viewContainerRef = this.componentHost.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    (<AmazonSignInClass>componentRef.instance).data = authComponent.data;
  }
}
