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

// tslint:disable:max-line-length
import { AuthenticatorComponentCore } from './components/authenticator/authenticator/authenticator.component.core';
import { ConfirmSignInComponentCore } from './components/authenticator/confirm-sign-in-component/confirm-sign-in-component.core';
import { ConfirmSignUpComponentCore } from './components/authenticator/confirm-sign-up-component/confirm-sign-up.component.core';
import { SignInComponentCore } from './components/authenticator/sign-in-component/sign-in.component.core';
import { SignUpComponentCore } from './components/authenticator/sign-up-component/sign-up.component.core';
import { RequireNewPasswordComponentCore } from './components/authenticator/require-new-password-component/require-new-password.component.core';
import { GreetingComponentCore } from './components/authenticator/greeting-component/greeting.component.core';
import { ForgotPasswordComponentCore } from './components/authenticator/forgot-password-component/forgot-password.component.core';
import { FormComponent } from './components/common/form.component';
// tslint:enable:max-line-length

const components = [
  AuthenticatorComponentCore,
  ConfirmSignInComponentCore,
  ConfirmSignUpComponentCore,
  SignInComponentCore,
  SignUpComponentCore,
  RequireNewPasswordComponentCore,
  GreetingComponentCore,
  ForgotPasswordComponentCore,
  FormComponent,
];

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    ...components,
  ],
  entryComponents: [
    ...components
  ],
  providers: [ ],
  exports: [
    ...components,
  ]
})
export class AmplifyAngularAuthModule { }
