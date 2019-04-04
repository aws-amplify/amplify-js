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
import { includes } from '../common';
import { UsernameAttributes } from '../types';
import { countrylist, country }  from '../../../assets/countries';

const template = `
<div class="amplify-container" *ngIf="_show">
  <div class="amplify-form-container">
    <div class="amplify-form-body">
      <div class="amplify-form-header">{{ this.amplifyService.i18n().get('Sign in to your account') }}</div>
      <div class="amplify-amplify-form-row amplify-signin-username">
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

      <div class="amplify-form-row amplify-signin-password">
        <label class="amplify-input-label" for="password">{{ this.amplifyService.i18n().get('Password *') }}</label>
        <input #amplifyPassword
          (keyup.enter)="onSignIn()"
          class="amplify-form-input"
          type="password"
          required
          placeholder="{{ this.amplifyService.i18n().get('Enter your password') }}"
          [(ngModel)]="password"
        />
        <span class="amplify-form-action">{{ this.amplifyService.i18n().get('Forgot Password?') }}
        <a class="amplify-form-link"
            (click)="onForgotPassword()"
          >{{ this.amplifyService.i18n().get('Reset your password') }}</a></span>
      </div>

      <div class="amplify-form-actions">

        <div class="amplify-form-cell-right">
          <button class="amplify-form-button"
            (click)="onSignIn()"
          >{{ this.amplifyService.i18n().get('Sign In') }}</button>
        </div>

        <div class="amplify-form-cell-left">
          <div class="amplify-form-signup">{{ this.amplifyService.i18n().get('No account?') }} <a class="amplify-form-link" (click)="onSignUp()">{{ this.amplifyService.i18n().get('Create account') }}</a></div>
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
`

@Component({
  selector: 'amplify-auth-sign-in-core',
  template: template
})
export class SignInComponentCore {
  _authState: AuthState;
  _show: boolean;
  _usernameAttributes: string | Array<string> = [];
  username: string;
  password: string;
  errorMessage: string;
  amplifyService: AmplifyService;
  countries: country[];
  local_phone_number: string = '';
  country_code: string = '1';
  email: string = '';

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.countries = countrylist;
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = includes(['signIn', 'signedOut', 'signedUp'], authState.state);
    this.username = authState.user? authState.user.username || '' : '';
    this.email = authState.user? authState.user.email || '' : '';
    this.country_code = authState.user && authState.user.country_code? authState.user.country_code  : this.country_code;
    this.local_phone_number = authState.user? authState.user.local_phone_number || '' : '';
  }

  @Input()
  set data(data: any) {
      this._usernameAttributes = data.usernameAttributes;
  }

  @Input()
  set usernameAttributes(usernameAttributes: string | Array<string>) {
    this._usernameAttributes = usernameAttributes;
  }

  onSignIn() {
    let signInUsername = '';
    if (this._usernameAttributes === UsernameAttributes.EMAIL) {
        signInUsername = this.email;
    } else if (this._usernameAttributes === UsernameAttributes.PHONE_NUMBER) {
       signInUsername = `+${this.country_code}${this.local_phone_number}`;
    } else {
      signInUsername = this.username;
    }

    this.amplifyService.auth().signIn(signInUsername, this.password)
      .then(user => {
        if (user['challengeName'] === 'SMS_MFA' || user['challengeName'] === 'SOFTWARE_TOKEN_MFA') {
          this.amplifyService.setAuthState({ state: 'confirmSignIn', user: user });
        } else if (user['challengeName'] === 'NEW_PASSWORD_REQUIRED') {
          this.amplifyService.setAuthState({ state: 'requireNewPassword', user: user });
        } else {
          this.amplifyService.setAuthState({ state: 'signedIn', user: user });
        }
      })
      .catch((err) => {
        this._setError(err);
      });
  }

  onAlertClose() {
    this._setError(null);
  }

  getUserObj() {
    const user = this.username || this.email || this.local_phone_number? 
      { 
        username: this.username,
        email: this.email,
        local_phone_number: this.local_phone_number,
        courtry_code: this.country_code
      } 
      : 
      null;

    return user;
  }

  onForgotPassword() {
    const user = this.getUserObj();
    this.amplifyService.setAuthState({ state: 'forgotPassword', user: user });
  }

  onSignUp() {
    const user = this.getUserObj();
    this.amplifyService.setAuthState({ state: 'signUp', user: user });
  }

  _setError(err) {
    if (!err) {
      this.errorMessage = null;
      return;
    }

    this.errorMessage = err.message || err;
  }
}
