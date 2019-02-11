// tslint:disable:max-line-length

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

import { NgModule , forwardRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DynamicComponentDirective } from './directives/dynamic.component.directive';
import { FormComponent } from './components/common/form.component';

const components = [
  FormComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
  ],
  declarations: [
    DynamicComponentDirective,
    ...components,
  ],
  entryComponents: [
    ...components
  ],
  exports: [
    ...components,
    DynamicComponentDirective,
    CommonModule,
    FormsModule
  ]
})
export class AmplifyAngularSharedModule { }
