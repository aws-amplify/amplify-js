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

import { Component, Input, OnInit, Inject } from '@angular/core';
import * as AmplifyUI from '@aws-amplify/ui';
import { AmplifyUIInterface } from '../../../assets/amplify-angular-theme.class';
import { classArray } from '../../../assets/helpers';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';


const template = `
<div class="{{applyClasses('formSection')}}" *ngIf="_show">
  <div class="{{applyClasses('sectionHeader')}}">Confirm Sign Up</div>
  <div class="{{applyClasses('sectionBody')}}">
    <div class="{{applyClasses('formField')}}">
      <div class="{{applyClasses('inputLabel')}}"> Username * </div>
      <input
        #amplifyUsername
       class="{{applyClasses('input')}}"
        type="text"
        disabled
        placeholder="Username"
        [value]="username"
      />
    </div>
    <div class="{{applyClasses('formField')}}">
      <div class="{{applyClasses('inputLabel')}}"> Confirmation Code * </div>
      <input
        #code
        (change)="setCode(code.value)"
        (keyup)="setCode(code.value)"
        (keyup.enter)="onConfirm()"
       class="{{applyClasses('input')}}"
        type="text"
        placeholder="Enter your Code"
      />
      <div class="{{applyClasses('hint')}}">
        Lost your code?
        <a class="{{applyClasses('a')}}" (click)="onResend()">
          Resend Code
        </a>
      </div>
    </div>
    <div class="{{applyClasses('sectionFooter')}}">
      <span class="{{applyClasses('sectionFooterPrimaryContent')}}">
        <a class="{{applyClasses('a')}}" (click)="onSignIn()">Back to Sign in</a>
      </span>
      <span class="{{applyClasses('sectionFooterSecondaryContent')}}">
        <button class="{{applyClasses('button')}}" (click)="onConfirm()">
          Confirm
        </button>
      </span>
    </div>
  </div>
  <div class="{{applyClasses('amplifyAlert')}}" 
  *ngIf="errorMessage">
    <div class="{{applyClasses('alertBody')}}">
      <span class="amplify-alert-icon {{_classOverrides.alertBody}}">&#9888;</span>
      <div class="{{applyClasses('alertMessage')}}">{{ errorMessage }}</div>
      <a class="{{applyClasses('alertClose')}}" (click)="onAlertClose()">&times;</a>
    </div>
  </div>
</div>
`;

@Component({
  selector: 'amplify-auth-confirm-sign-up-core',
  template
})

export class ConfirmSignUpComponentCore {
  _authState: AuthState;
  _show: boolean;
  username: string;
  code: string;
  errorMessage: string;
  amplifyService: AmplifyService;
  amplifyUI: AmplifyUI;
  _confirmSignUpConfig: any;
  _classOverrides: any;

  constructor(@Inject(AmplifyService) amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.amplifyUI = Object.assign({}, AmplifyUI);
    this._classOverrides = {};
    this._confirmSignUpConfig = {};
  }

  @Input()
  set data(data: any) {
    this._authState = data.authState;
    this._show = data.authState.state === 'confirmSignUp';
    this.username = data.authState.user? data.authState.user.username || '' : '';
    if (data.confirmSignUpConfig) {
      this._confirmSignUpConfig = data.confirmSignUpConfig;
    }
    if (data.classOverrides) {
      this._classOverrides = data.classOverrides;
    }
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = authState.state === 'confirmSignUp';
    this.username = authState.user? authState.user.username || '' : '';
  }

  @Input()
  set confirmSignUpConfig(confirmSignUpConfig: any) {
    this._confirmSignUpConfig = confirmSignUpConfig;
  }

  @Input()
  set classOverrides(classOverrides: AmplifyUIInterface) {
    this._classOverrides = classOverrides;
  }

  applyClasses(element) {
    return classArray(
      element, 
      { global: this._classOverrides, component: this._confirmSignUpConfig.classOverrides}
    );
  }

  setUsername(username: string) {
    this.username = username;
  }

  setCode(code: string) {
    this.code = code;
  }

  onConfirm() {
    this.amplifyService.auth()
      .confirmSignUp(
        this.username,
        this.code
      )
      .then(() => console.log('confirm success'))
      .catch(err => this._setError(err));
  }

  onResend() {
    this.amplifyService.auth().resendSignUp(this.username)
      .then(() => console.log('code resent'))
      .catch(err => this._setError(err));
  }

  onSignIn() {
    this.amplifyService.setAuthState({ state: 'signIn', user: null });
  }

  onAlertClose() {
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
