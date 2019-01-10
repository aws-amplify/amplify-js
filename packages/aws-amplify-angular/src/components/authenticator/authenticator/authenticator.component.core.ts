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

import { Component, Input, ViewEncapsulation } from '@angular/core';
import { AmplifyService, AuthState } from '../../../providers';
import { AmplifyUIInterface } from '../../../assets/amplify-angular-theme.class';


const template = `
  <div class="amplify-authenticator">
    <amplify-auth-sign-in-core
      *ngIf="!shouldHide('SignIn')"
      [authState]="authState"
      [signInConfig]="_signInConfig"
      [classOverrides]="_classOverrides"
    ></amplify-auth-sign-in-core>

    <amplify-auth-sign-up-core
      *ngIf="!shouldHide('SignUp')"
      [authState]="authState"
      [signUpConfig]="_signUpConfig"
      [classOverrides]="_classOverrides"
    ></amplify-auth-sign-up-core>

    <amplify-auth-confirm-sign-up-core
      *ngIf="!shouldHide('ConfirmSignUp')"
      [authState]="authState"
      [confirmSignUpConfig]="_confirmSignUpConfig"
      [classOverrides]="_classOverrides"
    ></amplify-auth-confirm-sign-up-core>

    <amplify-auth-confirm-sign-in-core
      *ngIf="!shouldHide('ConfirmSignIn')"
      [authState]="authState"
      [confirmSignInConfig]="_confirmSignInConfig"
      [classOverrides]="_classOverrides"
    ></amplify-auth-confirm-sign-in-core>

    <amplify-auth-forgot-password-core
    *ngIf="!shouldHide('ForgotPassword')"
    [authState]="authState"
    [forgotPasswordConfig]="_forgotPasswordConfig"
    [classOverrides]="_classOverrides"
    ></amplify-auth-forgot-password-core>

    <amplify-auth-greetings-core
    *ngIf="!shouldHide('Greetings')"
    [authState]="authState"
    ></amplify-auth-greetings-core>

     <amplify-auth-require-new-password-core
    *ngIf="!shouldHide('RequireNewPassword')"
    [authState]="authState"
    [requireNewPasswordConfig]="_requireNewPasswordConfig"
    [classOverrides]="_classOverrides"
    ></amplify-auth-require-new-password-core>
  </div>
`;


@Component({
  selector: 'amplify-authenticator-core',
  template,
  styles: [
    `.amplify-authenticator {
      width: var(--component-width-desktop);
      margin: 0 auto;
      border-radius: 6px;
      background-color: var(--color-white);
    }`,
    `.amplify-alert {
      min-height: 52px;
      width: 460px;
      margin-top: 5em;
      border-radius: 6px;
      background-color: #FFFFFF;
      box-shadow: 0 0 5px 0 rgba(0,0,0,0.3);
      }`
  ]
})
export class AuthenticatorComponentCore {
  authState: AuthState = {
    state: 'signIn',
    user: null
  };
  _signUpConfig: any = {};
  _signInConfig: any = {};
  _confirmSignUpConfig: any = {};
  _confirmSignInConfig: any = {};
  _requireNewPasswordConfig: any = {};
  _forgotPasswordConfig: any = {};
  _classOverrides: AmplifyUIInterface;
  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.subscribe();
  }

  @Input()
  hide: string[] = [];

  @Input()
  set data(data: any) {
    if (data.hide) {
      this.hide = data.hide;
    }
    if (data.signUpConfig) {
      this._signUpConfig = data.signUpConfig;
    }
    if (data.signInConfig) { 
      this._signInConfig = data.signInConfig;
    }
    if (data.confirmSignInConfig) {
      this._confirmSignInConfig = data.confirmSignInConfig;
    }
    if (data.classOverrides) {
      this._classOverrides = data.classOverrides;
    }
  }

  @Input()
  set signInConfig(signInConfig: any) {
    this._signInConfig = signInConfig;
  }

  @Input()
  set signUpConfig(signUpConfig: any) {
    this._signUpConfig = signUpConfig;
  }

  @Input()
  set confirmSignInConfig(confirmSignInConfig: any) {
    this._confirmSignInConfig = confirmSignInConfig;
  }

  @Input()
  set classOverrides(classOverrides: AmplifyUIInterface) {
    this._classOverrides = classOverrides;
  }

  subscribe() {
    this.amplifyService.authStateChange$
      .subscribe(
        state => {
          this.authState = state;
        }, 
        () => {
          this.authState = {
            'state': 'signIn',
            'user': null
          };
        });
  }

  shouldHide(comp) {
    return this.hide.filter(item => item === comp)
      .length > 0;
  }
}
