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

import { NgModule , forwardRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicComponentDirective } from './directives/dynamic.component.directive';
import { AmplifyAngularAuthModule } from './aws-amplify-angular-auth.module';
import { AmplifyAngularStorageModule } from './aws-amplify-angular-storage.module';

// import { FormComponent } from './components/common/form.component';
// tslint:enable:max-line-length

const components = [
  // AuthenticatorComponent,
  // AuthenticatorComponentCore,
  // ConfirmSignInComponent,
  // ConfirmSignInComponentCore,
  // ConfirmSignUpComponent,
  // ConfirmSignUpComponentCore,
  // SignInComponent,
  // SignInComponentCore,
  // SignUpComponent,
  // SignUpComponentCore,
  // RequireNewPasswordComponent,
  // RequireNewPasswordComponentCore,
  // GreetingComponent,
  // GreetingComponentCore,
  // ForgotPasswordComponent,
  // ForgotPasswordComponentCore,
  // S3AlbumComponent,
  // S3AlbumComponentCore,
  // S3ImageComponent,
  // S3ImageComponentCore,
  // PhotoPickerComponent,
  // PhotoPickerComponentCore,
  // ChatBotComponent,
  // ChatbotComponentCore,
  // FormComponent,
];

@NgModule({
  imports: [
    CommonModule,
    AmplifyAngularAuthModule,
    AmplifyAngularStorageModule
  ],
  declarations: [
    DynamicComponentDirective,
    ...components,
  ],
  entryComponents: [
    ...components
  ],
  providers: [ ],
  exports: [
    ...components,
    AmplifyAngularAuthModule,
    AmplifyAngularStorageModule
  ]
})
export class AmplifyAngularModule { }
