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
  <div class="{{applyClasses('sectionHeader')}}">{{this.header}}</div>
  <div class="{{applyClasses('sectionBody')}}">
    <div class="{{applyClasses('formField')}}">
      <div class="{{applyClasses('inputLabel')}}" > Confirmation Code *</div>
      <input #code
        (change)="setCode(code.value)"
        (keyup)="setCode(code.value)"
        (keyup.enter)="onConfirm()"
       class="{{applyClasses('input')}}"
        type="text"
        placeholder="Enter your Code"
      />
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
  selector: 'amplify-auth-confirm-sign-in-core',
  template
})
export class ConfirmSignInComponentCore {
  _authState: AuthState;
  _show: boolean;
  code: string;
  errorMessage: string;
  header: string = 'Confirm Sign In';
  amplifyService: AmplifyService;
  amplifyUI: AmplifyUI;
  _confirmSignInConfig: any;
  _classOverrides: any;

  constructor(@Inject(AmplifyService) amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.amplifyUI = Object.assign({}, AmplifyUI);
    this._classOverrides = {};
    this._confirmSignInConfig = {};
  }

  @Input()
  set data(data: any) {
    this._authState = data.authState;
    this._show = data.authState.state === 'confirmSignIn';
    if (data.confirmSignInConfig) {
      this._confirmSignInConfig = data.confirmSignInConfig;
      if (this._confirmSignInConfig.header) {
        this.header = this._confirmSignInConfig.header;
      }
    }
    if (data.classOverrides) {
      this._classOverrides = data.classOverrides;
    }
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = authState.state === 'confirmSignIn';
  }

  @Input()
  set confirmSignInConfig(confirmSignInConfig: any) {
    this._confirmSignInConfig = confirmSignInConfig;
    if (this._confirmSignInConfig.header) {
      this.header = this._confirmSignInConfig.header;
    }
  }

  @Input()
  set classOverrides(classOverrides: AmplifyUIInterface) {
    this._classOverrides = classOverrides;
  }

  applyClasses(element) {
    return classArray(
      element, 
      { global: this._classOverrides, component: this._confirmSignInConfig.classOverrides}
    );
  }

  setCode(code: string) {
    this.code = code;
  }

  onConfirm() {
    const { user } = this._authState;
    const { challengeName } = user;
    const mfaType = challengeName === 'SOFTWARE_TOKEN_MFA' ? challengeName : null;
    this.amplifyService.auth()
      .confirmSignIn(
        user,
        this.code,
        mfaType
      )
      .then(() => {
        this.amplifyService.setAuthState({ state: 'signedIn', user });
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
