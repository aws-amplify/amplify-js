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
  <div>
    <amplify-auth-sign-in-core
      *ngIf="!shouldHide('SignIn')"
      [authState]="authState"
      [signInConfig]="_signInConfig"
      [customCSS]="_customCSS"
    ></amplify-auth-sign-in-core>

    <amplify-auth-sign-up-core
      *ngIf="!shouldHide('SignUp')"
      [authState]="authState"
      [signUpConfig]="_signUpConfig"
      [customCSS]="_customCSS"
    ></amplify-auth-sign-up-core>

    <amplify-auth-confirm-sign-up-core
      *ngIf="!shouldHide('ConfirmSignUp')"
      [authState]="authState"
      [confirmSignUpConfig]="_confirmSignUpConfig"
      [customCSS]="_customCSS"
    ></amplify-auth-confirm-sign-up-core>

    <amplify-auth-confirm-sign-in-core
      *ngIf="!shouldHide('ConfirmSignIn')"
      [authState]="authState"
      [confirmSignInConfig]="_confirmSignInConfig"
      [customCSS]="_customCSS"
    ></amplify-auth-confirm-sign-in-core>

    <amplify-auth-forgot-password-core
    *ngIf="!shouldHide('ForgotPassword')"
    [authState]="authState"
    [forgotPasswordConfig]="_forgotPasswordConfig"
    [customCSS]="_customCSS"
    ></amplify-auth-forgot-password-core>

    <amplify-auth-greetings-core
    *ngIf="!shouldHide('Greetings')"
    [authState]="authState"
    ></amplify-auth-greetings-core>

     <amplify-auth-require-new-password-core
    *ngIf="!shouldHide('RequireNewPassword')"
    [authState]="authState"
    [requireNewPasswordConfig]="_requireNewPasswordConfig"
    [customCSS]="_customCSS"
    ></amplify-auth-require-new-password-core>
  </div>
`;


@Component({
  selector: 'amplify-authenticator-core',
  template
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
  _customCSS: AmplifyUIInterface;
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
    if (data.customCSS) {
      this._customCSS = data.customCSS;
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
  set customCSS(customCSS: AmplifyUIInterface) {
    this._customCSS = customCSS;
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
