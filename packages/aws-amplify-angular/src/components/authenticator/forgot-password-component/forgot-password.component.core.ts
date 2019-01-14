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
import { AmplifyUIInterface } from '../../../assets/amplify-angular-theme.class';
import { classArray } from '../../../assets/helpers';
import { AmplifyService, AuthState } from '../../../providers';


const template = `
<div class="{{applyClasses('formSection')}}" *ngIf="_show">
  <div class="{{applyClasses('sectionHeader')}}">{{this.header}}
    <br />
    <div *ngIf="!code_sent" class="{{applyClasses('hint')}}">
      You will receive a verification code
    </div>
    <div *ngIf="code_sent" class="{{applyClasses('hint')}}">
      Enter the code you received and set a new password
    </div>
  </div>
  <div class="{{applyClasses('sectionBody')}}">
    <div class="{{applyClasses('formField')}}"  *ngIf="!code_sent">
      <div class="{{applyClasses('inputLabel')}}">Username * </div>
      <input
        (keyup)="setUsername($event.target.value)"
       class="{{applyClasses('input')}}"
        type="text"
        placeholder="Username"
        [value]="username"
      />
    </div>
    <div class="{{applyClasses('formField')}}" *ngIf="code_sent">
      <div class="{{applyClasses('inputLabel')}}">Code * </div>
      <input #code
        (keyup)="setCode(code.value)"
        class="{{applyClasses('input')}}"
        type="text"
        placeholder="Enter code"
      />
    </div>
    <div class="{{applyClasses('formField')}}" *ngIf="code_sent">
      <div class="{{applyClasses('inputLabel')}}">Password * </div>
      <input #password
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSubmit()"
        class="{{applyClasses('input')}}"
        type="password"
        placeholder="Password"
      />
    </div>
    <div class="{{applyClasses('sectionFooter')}}">
      <span class="{{applyClasses('sectionFooterPrimaryContent')}} ">
        <button *ngIf="!code_sent" class="{{applyClasses('button')}}"
        (click)="onSend()">Submit</button>
        <button *ngIf="code_sent" class="{{applyClasses('button')}}"
        (click)="onSubmit()">Verify</button>
      </span>
      <span class="{{applyClasses('sectionFooterSecondaryContent')}}">
        <a *ngIf="code_sent" class="{{applyClasses('a')}}" 
        (click)="onSend()">Resend Code</a>
        <a *ngIf="!code_sent" class="{{applyClasses('a')}}" 
        (click)="onSignIn()">Back to Sign in</a>
      </span>
    </div>
  </div>
  <div class="{{applyClasses('amplifyAlert')}}" *ngIf="errorMessage">
    <div class="{{applyClasses('amplifyAlertBody')}}">
      <span class="{{applyClasses('amplifyAlertIcon')}}">&#9888;</span>
      <div class="{{applyClasses('amplifyAlertMessage')}}">{{ errorMessage }}</div>
      <a class="{{applyClasses('amplifyAlertClose')}}" (click)="onamplifyAlertClose()">&times;</a>
    </div>
  </div>
</div>
`;

@Component({
  selector: 'amplify-auth-forgot-password-core',
  template
})
export class ForgotPasswordComponentCore {
  _authState: AuthState;
  _show: boolean;
  username: string;
  code: string;
  password: string;
  errorMessage: string;
  header: string = 'Reset your password';
  code_sent = false;
  amplifyService: AmplifyService;
  amplifyUI: AmplifyUI;
  _forgotPasswordConfig: any;
  _classOverrides: any;

  constructor(@Inject(AmplifyService) amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.amplifyUI = Object.assign({}, AmplifyUI);
    this._classOverrides = {};
    this._forgotPasswordConfig = {};
  }

  @Input()
  set data(data: any) {
    this._authState = data.authState;
    this._show = data.authState.state === 'forgotPassword';
    this.username = data.authState.user? data.authState.user.username || '' : '';
    if (data.forgotPasswordConfig) {
      this._forgotPasswordConfig = data.forgotPasswordConfig;
    }
    if (this._forgotPasswordConfig.header) {
      this.header = this._forgotPasswordConfig.header;
    }
    if (data.classOverrides) {
      this._classOverrides = data.classOverrides;
    }
    
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = authState.state === 'forgotPassword';

    this.username = authState.user? authState.user.username || '' : '';
  }

  @Input()
  set forgotPasswordConfig(forgotPasswordConfig: any) {
    this._forgotPasswordConfig = forgotPasswordConfig;
    if (this._forgotPasswordConfig.header) {
      this.header = this._forgotPasswordConfig.header;
    }
  }

  @Input()
  set classOverrides(classOverrides: AmplifyUIInterface) {
    this._classOverrides = classOverrides;
  }

  applyClasses(element) {
    return classArray(
      element, 
      { global: this._classOverrides, component: this._forgotPasswordConfig.classOverrides}
    );
  }

  setUsername(username: string) {
    this.username = username;
  }

  setCode(code: string) {
    this.code = code;
  }

  setPassword(password: string) {
    this.password = password;
  }

  onSend() {
    if (!this.username) {
      this.errorMessage = "Username cannot be empty";
      return;
    }
    this.amplifyService.auth().forgotPassword(this.username)
      .then(() => {
        this.code_sent = true;
      })
      .catch((err) => {
        this._setError(err);
        this.code_sent = false;
      });
  }

  onSubmit() {
    this.amplifyService.auth()
      .forgotPasswordSubmit(
        this.username,
        this.code,
        this.password
      )
      .then(() => {
        const user = { username: this.username };
        this.amplifyService.setAuthState({ state: 'signIn', user });
      })
      .catch(err => this._setError(err));
  }

  onSignIn() {
    this.amplifyService.setAuthState({ state: 'signIn', user: null });
  }

  onamplifyAlertClose() {
    this._setError(null);
  }

  _setError(err) {
    if (!err) {
      this.errorMessage = null;
      return;
    }

    this.errorMessage = err.message || err;
  }
}
