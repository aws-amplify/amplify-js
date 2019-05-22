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
import { includes } from '../common';
import { auth } from '../../../assets/data-test-attributes';

const template = `
<div class="amplify-container" *ngIf="_show">
  <div class="amplify-form-container" data-test="${auth.signIn.section}">
    <div class="amplify-form-body" data-test="${auth.signIn.bodySection}">
      <div class="amplify-form-header" data-test="${auth.signIn.headerSection}">
        {{ this.amplifyService.i18n().get('Sign in to your account') }}
      </div>
      <div class="amplify-amplify-form-row amplify-signin-username">
        <label class="amplify-input-label" for="amplifyUsername">
          {{ this.amplifyService.i18n().get('Username *') }}
        </label>
        <input
          #amplifyUsername
          (keyup)="setUsername($event.target.value)"
          class="amplify-form-input"
          type="text"
          required
          placeholder="{{ this.amplifyService.i18n().get('Username') }}"
          [value]="username"
          data-test="${auth.signIn.usernameInput}"
        />
      </div>
      <div class="amplify-form-row amplify-signin-password">
        <label class="amplify-input-label" for="password">
          {{ this.amplifyService.i18n().get('Password *') }}
        </label>
        <input #password
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSignIn()"
          class="amplify-form-input"
          type="password"
          required
          placeholder="{{ this.amplifyService.i18n().get('Enter your password') }}"
          data-test="${auth.signIn.passwordInput}"
        />
        <span class="amplify-form-action" *ngIf="!shouldHide('ForgotPassword')">{{ this.amplifyService.i18n().get('Forgot Password?') }}
        <a class="amplify-form-link"
            (click)="onForgotPassword()"
            data-test="${auth.signIn.forgotPasswordLink}"
          >{{ this.amplifyService.i18n().get('Reset your password') }}</a></span>
      </div>
      <div class="amplify-form-actions">
        <div class="amplify-form-cell-right">
          <button class="amplify-form-button"
            (click)="onSignIn()"
            data-test="${auth.signIn.signInButton}"
          >{{ this.amplifyService.i18n().get('Sign In') }}</button>
        </div>
        <div class="amplify-form-cell-left" *ngIf="!shouldHide('SignUp')">
          <div class="amplify-form-signup">
            {{ this.amplifyService.i18n().get('No account?') }}
            <a
              class="amplify-form-link"
              (click)="onSignUp()"
              data-test="${auth.signIn.createAccountLink}"
              >
              {{ this.amplifyService.i18n().get('Create account') }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="amplify-alert" *ngIf="errorMessage">
    <div class="amplify-alert-body">
      <span class="amplify-alert-icon">&#9888;</span>
      <div
        class="amplify-alert-message"
        data-test="${auth.signIn.signInError}"
        >
          {{ this.amplifyService.i18n().get(errorMessage) }}</div>
      <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
    </div>
  </div>
</div>
`;

@Component({
  selector: 'amplify-auth-sign-in-core',
  template
})
export class SignInComponentCore implements OnInit {
  _authState: AuthState;
  _show: boolean;
  username: string;
  password: string;
  errorMessage: string;
  protected logger: any;

  constructor(@Inject(AmplifyService) protected amplifyService: AmplifyService) {
    this.logger = this.amplifyService.logger('SignInComponent');
  }

  @Input()
  set data(data: any) {
    this.hide = data.hide ? data.hide : this.hide;
  }

  @Input() hide: string[] = [];

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = includes(['signIn', 'signedOut', 'signedUp'], authState.state);
    this.username = authState.user? authState.user.username || '' : '';
  }

  ngOnInit() {
    if (!this.amplifyService.auth()){
      throw new Error('Auth module not registered on AmplifyService provider');
    }
  }

  shouldHide(comp) {
    return this.hide.filter(item => item === comp)
      .length > 0;
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
        this._setError(err);
      });
  }

  onAlertClose() {
    this._setError(null);
  }

  onForgotPassword() {
    this.onAlertClose();
    const user = this.username ? { username: this.username } : null;
    this.amplifyService.setAuthState({ state: 'forgotPassword', user });
  }

  onSignUp() {
    this.onAlertClose();
    const user = this.username? { username: this.username } : null;
    this.amplifyService.setAuthState({ state: 'signUp', user });
  }

  _setError(err) {
    if (!err) {
      this.errorMessage = null;
      return;
    }
    this.errorMessage = err.message || err;
    this.logger.error(this.errorMessage);
  }
}
