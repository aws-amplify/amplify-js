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

import { Component, Input, Inject } from '@angular/core';
import * as AmplifyUI from '@aws-amplify/ui';
import { AmplifyService, AuthState } from '../../../providers';
import { classArray } from '../../../assets/helpers';
import { includes } from '../common';

const template = `
<div class="{{applyClasses('formSection')}}" *ngIf="_show">
  <div class="{{applyClasses('sectionHeader')}}">{{this.header}}</div>
  <div class="{{applyClasses('sectionBody')}}">
    <div class="{{applyClasses('formField')}}">
      <div class="{{applyClasses('inputLabel')}}">Username * </div>
      <input
        #amplifyUsername
        (keyup)="setUsername($event.target.value)"
        class="{{applyClasses('input')}}"
        type="text"
        required
        placeholder="Username"
        [value]="username"
      />
    </div>
    <div class="{{applyClasses('formField')}}">
      <div class="{{applyClasses('inputLabel')}}">Password * </div>
      <input
        #password
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSignIn()"
        class="{{applyClasses('input')}}"
        type="password"
        required
        placeholder="Enter your password"
      />
      <div class="{{applyClasses('hint')}}">
        Forget your password?
        <a class="{{applyClasses('a')}}" (click)="onForgotPassword()">
          Reset your password
        </a>
      </div>
    </div>
  </div>
  <div class="{{applyClasses('sectionFooter')}}">
    <span class="{{applyClasses('sectionFooterPrimaryContent')}}">
      <button class="{{applyClasses('button')}}"
        (click)="onSignIn()">
          Sign In
      </button>
    </span>
    <span class="{{applyClasses('sectionFooterSecondaryContent')}}">
        No account?  
        <a class="{{applyClasses('a')}}" (click)="onSignUp()">Create account</a>
    </span>
  </div>
  <div class="{{applyClasses('amplifyAlert')}}"  *ngIf="errorMessage">
    <div class="{{applyClasses('amplifyAlertBody')}}">
      <span class="{{applyClasses('amplifyAlertIcon')}}">&#9888;</span>
      <div class="{{applyClasses('amplifyAlertMessage')}}">{{ errorMessage }}</div>
      <a class="{{applyClasses('amplifyAlertClose')}}"
        (click)="onamplifyAlertClose()">
          &times;
      </a>
    </div>
  </div>
</div>
`;

@Component({
  selector: 'amplify-auth-sign-in-core',
  template
})
export class SignInComponentCore {
  _authState: AuthState;
  _show: boolean;
  username: string;
  password: string;
  header: string = 'Sign In';
  errorMessage: string;
  amplifyService: AmplifyService;
  amplifyUI: AmplifyUI;
  _signInConfig: any;
  _classOverrides: any;

  constructor(@Inject(AmplifyService) amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.amplifyUI = Object.assign({}, AmplifyUI);
    this._classOverrides = {};
    this._signInConfig = {};
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = includes(['signIn', 'signedOut', 'signedUp'], authState.state);
    this.username = authState.user? authState.user.username || '' : '';
  }

  @Input()
  set data(data: any) {
    this._authState = data.authState;
    this._show = includes(['signIn', 'signedOut', 'signedUp'], this._authState.state);
    this.username = this._authState.user && this._authState.user.username ?
    this._authState.user.username : '';

    if (data.signInConfig) {
      this._signInConfig = data.signInConfig;
      if (data.signInConfig.header) {
        this.header = data.signInConfig.header;
      }
    }
    if (data.classOverrides) {
      this._classOverrides = data.classOverrides;
    }
  }

  @Input()
  set signInConfig(signInConfig: any) {
    this._signInConfig = signInConfig;
    if (signInConfig.header) {
      this.header = signInConfig.header;
    }
  }

  @Input()
  set classOverrides(classOverrides) {
    this._classOverrides = classOverrides;
  }

  applyClasses(element) {
    return classArray(
      element, 
      { global: this._classOverrides, component: this._signInConfig.classOverrides}
    );
  }

  setUsername(username: string) {
    this.username = username;
  }

  setPassword(password: string) {
    this.password = password;
  }

  onSignIn() {
    this.amplifyService.auth().signIn(this.username, this.password)
      .then(user => {
        if (user['challengeName'] === 'SMS_MFA' || user['challengeName'] === 'SOFTWARE_TOKEN_MFA') {
          this.amplifyService.setAuthState({ state: 'confirmSignIn', user });
        } else if (user['challengeName'] === 'NEW_PASSWORD_REQUIRED') {
          this.amplifyService.setAuthState({ state: 'requireNewPassword', user });
        } else {
          this.amplifyService.setAuthState({ state: 'signedIn', user });
        }
      })
      .catch((err) => {
        if (err.code === 'PasswordResetRequiredException') {
          this.amplifyService.setAuthState({
            state: 'forgotPassword', 
            user: {username: this.username}
          });
        } else {
          this._setError(err);
        }
      });
  }

  onamplifyAlertClose() {
    this._setError(null);
  }

  onForgotPassword() {
    const user = this.username? { username: this.username } : null;
    this.amplifyService.setAuthState({ state: 'forgotPassword', user });
  }

  onSignUp() {
    const user = this.username? { username: this.username } : null;
    this.amplifyService.setAuthState({ state: 'signUp', user });
  }

  _setError(err) {
    if (!err) {
      this.errorMessage = null;
      return;
    }

    this.errorMessage = err.message || err;
  }
}
