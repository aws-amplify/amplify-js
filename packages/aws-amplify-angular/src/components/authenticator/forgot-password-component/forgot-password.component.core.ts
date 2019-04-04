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
import { AmplifyService, AuthState } from '../../../providers';
import { UsernameAttributes } from '../types';
import { countrylist, country }  from '../../../assets/countries';

const template = `
<div class="amplify-container" *ngIf="_show">
  <div class="amplify-form-container">
    <div class="amplify-form-body">
    <div class="amplify-form-header">{{ this.amplifyService.i18n().get('Reset your password') }}</div>
    <div class="amplify-form-text" *ngIf="!code_sent">{{ this.amplifyService.i18n().get('You will receive a verification code') }}</div>
    <div class="amplify-form-text" *ngIf="code_sent">{{ this.amplifyService.i18n().get('Enter the code you received and set a new password') }}</div>
    <div class="amplify-form-row" *ngIf="!code_sent">
      <div *ngIf="this._usernameAttributes === 'email'">
          <label class="amplify-input-label" for="signInEmail"> {{ this.amplifyService.i18n().get('Email') }} *</label>
          <input
            #signInEmail
            class="amplify-form-input"
            type="text"
            required
            placeholder="{{ this.amplifyService.i18n().get('Enter your email') }}"
            [(ngModel)]="email"
          />
        </div>
        <div *ngIf="this._usernameAttributes === 'phone_number'">
          <label class="amplify-input-label" for="signInLocalPhoneNumber">
            {{ this.amplifyService.i18n().get("Phone Number") }} *
          </label>

          <div class="amplify-input-group">
            <div class="amplify-input-group-item">
              <select 
                #signInCountryCode
                name="countryCode"
                class="amplify-select-phone-country"
                [(ngModel)]="country_code">
                <option *ngFor="let country of countries"
                  value={{country.value}}>{{country.label}}
                </option>
              </select>
            </div>
            <div class="amplify-input-group-item">
              <input
                #signInLocalPhoneNumber
                class="amplify-form-input"
                [placeholder]="this.amplifyService.i18n().get('Enter your phone number')"
                [(ngModel)]="local_phone_number"
                name="local_phone_number"
                type="text"
              />
            </div>
          </div>
        </div>
        <div *ngIf="this._usernameAttributes !== 'email' && this._usernameAttributes !== 'phone_number'">
          <label class="amplify-input-label" for="signInUsername"> {{ this.amplifyService.i18n().get('Username *') }}</label>
          <input
            #signInUsername
            class="amplify-form-input"
            type="text"
            required
            placeholder="{{ this.amplifyService.i18n().get('Username') }}"
            [(ngModel)]="username"
          />
        </div>
      </div>
      <div class="amplify-form-row" *ngIf="code_sent">
      <label class="amplify-input-label" for="code"> {{ this.amplifyService.i18n().get('Confirmation Code *') }}</label>
        <input #code
          (keyup)="setCode(code.value)"
          class="amplify-form-input"
          type="text"
          placeholder="{{ this.amplifyService.i18n().get('Enter code') }}"
        />
      </div>
      <div class="amplify-form-row" *ngIf="code_sent">
      <label class="amplify-input-label" for="password"> {{ this.amplifyService.i18n().get('New Password *') }}</label>
        <input #password
          (keyup)="setPassword(password.value)"
          (keyup.enter)="onSubmit()"
          class="amplify-form-input"
          type="password"
          placeholder="{{ this.amplifyService.i18n().get('Password') }}"
        />
      </div>

      <div class="amplify-form-actions">

        <div class="amplify-form-cell-right">
          <button class="amplify-form-button"
            *ngIf="!code_sent"
            (click)="onSend()">{{ this.amplifyService.i18n().get('Submit') }}</button>

          <button class="amplify-form-button"
            *ngIf="code_sent"
            (click)="onSubmit()">{{ this.amplifyService.i18n().get('Verify') }}</button>
        </div>

        <div class="amplify-form-cell-left">
          <div class="amplify-form-actions-left">
            <a *ngIf="code_sent" class="amplify-form-link" (click)="onSend()">{{ this.amplifyService.i18n().get('Resend Code') }}</a>
            <a *ngIf="!code_sent" class="amplify-form-link" (click)="onSignIn()">{{ this.amplifyService.i18n().get('Back to Sign in') }}</a>
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
export class ForgotPasswordComponentCore {
  _authState: AuthState;
  _show: boolean;
  _usernameAttributes: string | Array<string> = [];
  
  username: string;
  code: string;
  password: string;

  errorMessage: string;

  code_sent = false;

  amplifyService: AmplifyService;
  countries: country[];
  local_phone_number: string;
  country_code: string = '1';
  email: string;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.countries = countrylist;
  }

  @Input()
  set data(data: any) {
    this._authState = data.authState;
    this._show = data.authState.state === 'forgotPassword';
    this._usernameAttributes = data.usernameAttributes;

    this.username = data.authState.user? data.authState.user.username || '' : '';
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = authState.state === 'forgotPassword';

    this.username = authState.user? authState.user.username || '' : '';
    this.email = authState.user? authState.user.email || '' : '';
    this.country_code = authState.user? authState.user.country_code || '' : '';
    this.local_phone_number = authState.user? authState.user.local_phone_number || '' : '';
  }

  @Input()
  set usernameAttributes(usernameAttributes: string | Array<string>) {
    this._usernameAttributes = usernameAttributes;
  }

  setUsername(username: string) {
    this.username = username;

    if (this._usernameAttributes === UsernameAttributes.PHONE_NUMBER) {
        this.username = `+${this.country_code}${this.local_phone_number}`;
    }
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
        this._setError(err)
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
