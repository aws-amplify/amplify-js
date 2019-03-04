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

import { Component, Input } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';

const template = `
<div class="amplify-container" *ngIf="_show">
<div class="amplify-form-container">
  <div class="amplify-form-body">
    <div class="amplify-form-header">Confirm Sign up</div>

    <div class="amplify-form-row">
      <label class="amplify-input-label" for="amplifyUsername"> Username *</label>
      <input
        #amplifyUsername
        class="amplify-form-input"
        type="text"
        disabled
        placeholder="Username"
        [value]="username"
      />
    </div>
    <div class="amplify-form-row">
      <label class="amplify-input-label" for="code"> Confirmation Code *</label>
      <input #code
        (change)="setCode(code.value)"
        (keyup)="setCode(code.value)"
        (keyup.enter)="onConfirm()"
        class="amplify-form-input"
        type="text"
        placeholder="Enter your Code"
      />
      <span class="amplify-form-action">Lost your code?
        <a class="amplify-form-link"
            (click)="onResend()"
          >Resend Code</a></span>    
    </div>
    
    <div class="amplify-form-actions">
      <div class="amplify-form-cell-left">
        <div class="amplify-form-actions-left">
          <a class="amplify-form-link" (click)="onSignIn()">Back to Sign in</a>
        </div>
      </div>

      <div class="amplify-form-cell-right">
        <button class="amplify-form-button"
          (click)="onConfirm()">Confirm</button>
      </div>
    </div>

  </div>

</div>

<div class="amplify-alert" *ngIf="errorMessage">
  <div class="amplify-alert-body">
    <span class="amplify-alert-icon">&#9888;</span>
    <div class="amplify-alert-message">{{ errorMessage }}</div>
    <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
  </div>
</div>

</div>
`

@Component({
  selector: 'amplify-auth-confirm-sign-up-core',
  template: template
})

export class ConfirmSignUpComponentCore {
  _authState: AuthState;
  _show: boolean;
  username: string;
  code: string;
  errorMessage: string;
  amplifyService: AmplifyService;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
  }

  @Input()
  set data(data: any) {
    this._authState = data.authState;
    this._show = data.authState.state === 'confirmSignUp';

    this.username = data.authState.user? data.authState.user.username || '' : '';
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = authState.state === 'confirmSignUp';

    this.username = authState.user? authState.user.username || '' : '';
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
