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

<<<<<<< HEAD
import { Component, Input, OnInit, Inject } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
import { includes, labelMap, composePhoneNumber } from '../common';
import { UsernameAttributes, UsernameFieldOutput } from '../types';
import { auth } from '../../../assets/data-test-attributes';

const template = `
<div class="amplify-container" *ngIf="_show">
  <div class="amplify-form-container" data-test="${auth.signIn.section}">
    <div class="amplify-form-body" data-test="${auth.signIn.bodySection}">
      <div class="amplify-form-header" data-test="${auth.signIn.headerSection}">
        {{ this.amplifyService.i18n().get('Sign in to your account') }}
      </div>
      <amplify-auth-username-field-core
        [usernameAttributes]="_usernameAttributes"
        (usernameFieldChanged)="onUsernameFieldChanged($event)"
      ></amplify-auth-username-field-core>
      <div class="amplify-form-row amplify-signin-password">
        <label class="amplify-input-label" for="passwordField">{{ this.amplifyService.i18n().get('Password *') }}</label>
        <input #passwordField
          (keyup)="setPassword(passwordField.value)"
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
=======
import { Component, Input, OnInit } from '@angular/core';
import * as AmplifyUI from '@aws-amplify/ui';
import { AmplifyService, AuthState } from '../../../providers';
import { AmplifyUIInterface } from '../../../assets/amplify-angular-theme.class';
import { joinKeys, appendCustomClasses } from '../../../assets/helpers';
import { includes } from '../common';

const template = `
<div class="{{amplifyUI.formSection}}" *ngIf="_show">
  <div class={{amplifyUI.sectionHeader}}>Sign In</div>
  <div class={{amplifyUI.sectionBody}}>
    <div class={{amplifyUI.formField}}>
      <div class={{amplifyUI.inputLabel}}>Username * </div>
      <input
        #amplifyUsername
        (keyup)="setUsername($event.target.value)"
        class={{amplifyUI.input}}
        type="text"
        required
        placeholder="Username"
        [value]="username"
      />
    </div>
    <div class={{amplifyUI.formField}}>
      <div class={{amplifyUI.inputLabel}}>Password * </div>
      <input
        #password
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSignIn()"
        class={{amplifyUI.input}}
        type="password"
        required
        placeholder="Enter your password"
      />
      <div class={{amplifyUI.hint}}>
        Forget your password?
        <a class={{amplifyUI.a}} (click)="onForgotPassword()">
          Reset your password
        </a>
      </div>
    </div>
  </div>
  <div class={{amplifyUI.sectionFooter}}>
    <span class="amplifyUI.sectionFooterPrimaryContent">
      <button 
        class={{amplifyUI.button}}
        (click)="onSignIn()">
          Sign In
      </button>
    </span>
    <span class={{amplifyUI.sectionFooterSecondaryContent}}>
        No account?  
        <a class={{amplifyUI.a}} (click)="onSignUp()">Create account</a>
    </span>
  </div>
  <div class="amplify-alert"  *ngIf="errorMessage">
    <div class="amplify-alert-body">
      <span class="amplify-alert-icon">&#9888;</span>
      <div class="amplify-alert-message">{{ errorMessage }}</div>
      <a 
        class="amplify-alert-close"
        (click)="onAlertClose()">
          &times;
      </a>
>>>>>>> initial commit
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
  _usernameAttributes: string = 'username';
  username: string;
  password: string;
  errorMessage: string;
<<<<<<< HEAD
  local_phone_number: string = '';
  country_code: string = '1';
  email: string = '';    

  signInUsername = '';
  protected logger: any;

  constructor(@Inject(AmplifyService) protected amplifyService: AmplifyService) {
    this.logger = this.amplifyService.logger('SignInComponent');
    this.onUsernameFieldChanged = this.onUsernameFieldChanged.bind(this);
=======
  amplifyService: AmplifyService;
  amplifyUI: AmplifyUI;
  private _signInConfig: any;
  private _customCSS: any;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.amplifyUI = Object.assign({}, AmplifyUI);
    this._customCSS = {};
>>>>>>> initial commit
  }

  @Input()
  set data(data: any) {
    this.hide = data.hide ? data.hide : this.hide;
    this._usernameAttributes = data.usernameAttributes;
  }

  @Input() hide: string[] = [];

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
  set usernameAttributes(usernameAttributes: string) {
    this._usernameAttributes = usernameAttributes;
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

  @Input()
  set data(data: any) {
    this._authState = data.authState;
    if (data.signInConfig) {
      this._signInConfig = data.signInConfig;
    }
    if (data.customCSS) {
      this._customCSS = data.customCSS;
    }
  }

  @Input()
  set signInConfig(signInConfig: any) {
    this._signInConfig = signInConfig;
  }

  @Input()
  set customCSS(customCSS: AmplifyUIInterface) {
    this._customCSS = customCSS;
  }

  ngOnInit() {
    if ((this._signInConfig && this._signInConfig.customCSS) || this._customCSS) {
      const allClasses = {
        ...this._customCSS,
        signInConfig: this._signInConfig && this._signInConfig.customCSS ? 
        this._signInConfig.customCSS : {}
      };
      this._customCSS = joinKeys(allClasses, 'signInConfig') as AmplifyUIInterface;
      this.amplifyUI = appendCustomClasses(this.amplifyUI, this._customCSS);
    }
  }

  setUsername(username: string) {
    this.username = username;
  }

  setPassword(password: string) {
    this.password = password;
  }

  onSignIn() {
    this.amplifyService.auth().signIn(this.getSignInUsername(), this.password)
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
<<<<<<< HEAD
    const user = this.getUserObj();
    this.onAlertClose();
=======
    const user = this.username? { username: this.username } : null;
>>>>>>> initial commit
    this.amplifyService.setAuthState({ state: 'forgotPassword', user });
  }

  onSignUp() {
<<<<<<< HEAD
    const user = this.getUserObj();
    this.onAlertClose();
=======
    const user = this.username? { username: this.username } : null;
>>>>>>> initial commit
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

  onUsernameFieldChanged(event: UsernameFieldOutput) {
    this.email = event.email || this.email;
    this.username = event.username || this.username;
    this.country_code = event.country_code || this.country_code;
    this.local_phone_number = event.local_phone_number || this.local_phone_number;
  }

  getSignInUsername() {
    switch(this._usernameAttributes) {
      case UsernameAttributes.EMAIL:
        return this.email;
      case UsernameAttributes.PHONE_NUMBER:
        return composePhoneNumber(this.country_code, this.local_phone_number);
      default:
        return this.username;
    }
  }
}
