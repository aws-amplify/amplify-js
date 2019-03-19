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

const template = `
  <div class="amplify-authenticator">
    <amplify-auth-sign-in-core
      *ngIf="!shouldHide('SignIn')"
      [authState]="authState"
    ></amplify-auth-sign-in-core>

    <amplify-auth-sign-up-core
      *ngIf="!shouldHide('SignUp')"
      [authState]="authState"
      [signUpConfig]="_signUpConfig"
    ></amplify-auth-sign-up-core>

    <amplify-auth-confirm-sign-up-core
      *ngIf="!shouldHide('ConfirmSignUp')"
      [authState]="authState"
    ></amplify-auth-confirm-sign-up-core>

    <amplify-auth-confirm-sign-in-core
    *ngIf="!shouldHide('ConfirmSignIn')"
    [authState]="authState"
    ></amplify-auth-confirm-sign-in-core>

    <amplify-auth-forgot-password-core
    *ngIf="!shouldHide('ForgotPassword')"
    [authState]="authState"
    ></amplify-auth-forgot-password-core>

    <amplify-auth-greetings-core
    *ngIf="!shouldHide('Greetings')"
    [authState]="authState"
    ></amplify-auth-greetings-core>

     <amplify-auth-require-new-password-core
    *ngIf="!shouldHide('RequireNewPassword')"
    [authState]="authState"
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
  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.subscribe();
  }

  @Input()
  hide: string[] = [];

  @Input()
  set data(data: any) {
    if (data.signUpConfig) {
      this._signUpConfig = data.signUpConfig;
    }
    if (data.hide) {
      this.hide = data.hide;
    }
  }

  @Input()
  set signUpConfig(signUpConfig: any) {
    this._signUpConfig = signUpConfig;
  }

  subscribe() {
    this.amplifyService.authStateChange$
      .subscribe(state => {
        this.authState = state;
      }, () => {
        this.authState = {
          'state': 'signIn',
          'user': null
        }
      });
  }

  shouldHide(comp) {
    return this.hide.filter(item => item === comp)
      .length > 0;
  }
}
