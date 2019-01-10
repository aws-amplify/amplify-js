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

import { Component, Input, ViewEncapsulation, Injector, ElementRef, OnInit } from '@angular/core';

import { AmplifyService, AuthState } from '../../../providers';
import { AuthenticatorComponentCore } from './authenticator.component.core';

const template = `
<div class="amplify-authenticator">

  <amplify-auth-sign-in-ionic
    *ngIf="!shouldHide('SignIn')"
    [authState]="authState"
    [signInConfig]="_signInConfig"
    [classOverrides]="_classOverrides"
  ></amplify-auth-sign-in-ionic>

  <amplify-auth-sign-up-ionic
    *ngIf="!shouldHide('SignUp')"
    [authState]="authState"
    [signUpConfig]="_signUpConfig"
    [classOverrides]="_classOverrides"
  ></amplify-auth-sign-up-ionic>

  <amplify-auth-confirm-sign-up-ionic
    *ngIf="!shouldHide('ConfirmSignUp')"
    [authState]="authState"
    [confirmSignUpConfig]="_confirmSignUpConfig"
    [classOverrides]="_classOverrides"
  ></amplify-auth-confirm-sign-up-ionic>

  <amplify-auth-confirm-sign-in-ionic
  *ngIf="!shouldHide('ConfirmSignIn')"
  [authState]="authState"
  [confirmSignInConfig]="_confirmSignInConfig"
  [classOverrides]="_classOverrides"
  ></amplify-auth-confirm-sign-in-ionic>

  <amplify-auth-forgot-password-ionic
  *ngIf="!shouldHide('ForgotPassword')"
  [authState]="authState"
  [forgotPasswordConfig]="_forgotPasswordConfig"
  [classOverrides]="_classOverrides"
  ></amplify-auth-forgot-password-ionic>

  <amplify-auth-greetings-ionic
  *ngIf="!shouldHide('Greetings')"
  [authState]="authState"
  ></amplify-auth-greetings-ionic>

  <amplify-auth-require-new-password-ionic
  *ngIf="!shouldHide('RequireNewPassword')"
  [authState]="authState"
  [requireNewPasswordConfig]="_requireNewPasswordConfig"
  [classOverrides]="_classOverrides"
  ></amplify-auth-require-new-password-ionic>
</div>
`;

@Component({
  selector: 'amplify-authenticator-ionic',
  template,
  styles: [
    `.amplify-authenticator {
      width: var(--component-width-desktop);
      margin: 0 auto;
      border-radius: 6px;
      background-color: var(--color-white);
    }`
  ]
})
export class AuthenticatorIonicComponent extends AuthenticatorComponentCore implements OnInit {

  amplifyService: AmplifyService;
  ionicCSS = {
    inputLabel: ['amplify-input-label'],
    input: ['amplify-form-input']
  };

  constructor(amplifyService: AmplifyService) {
    super(amplifyService);
  }

  ngOnInit() {
    this._classOverrides = Object.assign(this.ionicCSS, this._classOverrides);
  }
}
