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
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
import { auth } from '../../../assets/data-test-attributes';

const template = `
<div class="amplify-container" *ngIf="_show">
  <div class="amplify-form-container" data-test="${auth.forgotPassword.section}">
    <div class="amplify-form-body" data-test="${auth.forgotPassword.bodySection}">
    <div class="amplify-form-header" data-test="${auth.forgotPassword.headerSection}">
      {{ this.amplifyService.i18n().get('Reset your password') }}
    </div>
    <div class="amplify-form-text" *ngIf="!code_sent">
      {{ this.amplifyService.i18n().get('You will receive a verification code') }}
    </div>
    <div class="amplify-form-text" *ngIf="code_sent">
      {{ this.amplifyService.i18n().get('Enter the code you received and set a new password') }}
    </div>
    <div class="amplify-form-row" *ngIf="!code_sent">
      <label class="amplify-input-label" for="usernameinput">
        {{ this.amplifyService.i18n().get('Username *') }}
      </label>
      <input #usernameinput
        (keyup)="setUsername($event.target.value)"
        class="amplify-form-input"
        type="text"
        placeholder="{{ this.amplifyService.i18n().get('Username') }}"
        [value]="username"
        data-test="${auth.forgotPassword.usernameInput}"
      />
      </div>
      <div class="amplify-form-row" *ngIf="code_sent">
      <label class="amplify-input-label" for="code">
        {{ this.amplifyService.i18n().get('Confirmation Code *') }}
      </label>
      <input #code
        (keyup)="setCode(code.value)"
        class="amplify-form-input"
        type="text"
        placeholder="{{ this.amplifyService.i18n().get('Enter code') }}"
        data-test="${auth.forgotPassword.codeInput}"
      />
      </div>
      <div class="amplify-form-row" *ngIf="code_sent">
      <label class="amplify-input-label" for="password">
        {{ this.amplifyService.i18n().get('New Password *') }}
      </label>
      <input #password
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSubmit()"
        class="amplify-form-input"
        type="password"
        placeholder="{{ this.amplifyService.i18n().get('Password') }}"
        data-test="${auth.forgotPassword.newPasswordInput}"
      />
      </div>
      <div class="amplify-form-actions">
        <div class="amplify-form-cell-right">
          <button class="amplify-form-button"
            *ngIf="!code_sent"
            (click)="onSend()"
            data-test="${auth.forgotPassword.sendCodeButton}"
            >
              {{ this.amplifyService.i18n().get('Submit') }}</button>
          <button class="amplify-form-button"
            *ngIf="code_sent"
            (click)="onSubmit()"
            data-test="${auth.forgotPassword.submitButton}"
            >
              {{ this.amplifyService.i18n().get('Verify') }}</button>
        </div>
        <div class="amplify-form-cell-left">
          <div class="amplify-form-actions-left">
            <a
              *ngIf="code_sent"
              class="amplify-form-link"
              (click)="onSend()"
              data-test="${auth.forgotPassword.resendCodeLink}"
              >
              {{ this.amplifyService.i18n().get('Resend Code') }}
            </a>
            <a
              *ngIf="!code_sent"
              class="amplify-form-link"
              (click)="onSignIn()"
              data-test="${auth.forgotPassword.backToSignInLink}"
              >
              {{ this.amplifyService.i18n().get('Back to Sign in') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="amplify-alert" *ngIf="errorMessage">
    <div class="amplify-alert-body">
      <span class="amplify-alert-icon">&#9888;</span>
      <div class="amplify-alert-message">{{ this.amplifyService.i18n().get(errorMessage) }}</div>
      <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
    </div>
  </div>
</div>
`;

@Component({
  selector: 'amplify-auth-forgot-password-core',
  template
})
export class ForgotPasswordComponentCore implements OnInit {
  _authState: AuthState;
  _show: boolean;
  username: string;
  code: string;
  password: string;
  errorMessage: string;
  code_sent = false;
  protected logger: any;

  constructor(@Inject(AmplifyService) protected amplifyService: AmplifyService) {
    this.logger = this.amplifyService.logger('ForgotPasswordComponent');
  }

  @Input()
  set data(data: any) {
    this._authState = data.authState;
    this._show = data.authState.state === 'forgotPassword';
    this.hide = data.hide ? data.hide : this.hide;

    this.username = (data.authState.user &&
       data.authState.user.username) ?
       data.authState.user.username : '';
  }

  @Input() hide: string[] = [];

  shouldHide(comp) {
    return this.hide.filter(item => item === comp)
            .length > 0;
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = authState.state === 'forgotPassword';

    this.username = (authState.user && authState.user.username) ? authState.user.username : '';
  }

  ngOnInit() {
    if (!this.amplifyService.auth()){
      throw new Error('Auth module not registered on AmplifyService provider');
    }
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
        this.onAlertClose();
        this.amplifyService.setAuthState({ state: 'signIn', user });
      })
      .catch(err => this._setError(err));
  }

  onSignIn() {
    this.onAlertClose();
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
