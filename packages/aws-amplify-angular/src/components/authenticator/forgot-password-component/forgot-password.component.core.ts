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
import { UsernameAttributes, UsernameFieldOutput } from '../types';
import { Component, Input, OnInit, Inject } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
import { labelMap, composePhoneNumber } from '../common';
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
    <amplify-auth-username-field-core
      *ngIf="!code_sent"
      [usernameAttributes]="_usernameAttributes"
      (usernameFieldChanged)="onUsernameFieldChanged($event)"
    ></amplify-auth-username-field-core>
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
=======

import { Component, Input, OnInit } from '@angular/core';
import * as AmplifyUI from '@aws-amplify/ui';
import { AmplifyUIInterface } from '../../../assets/amplify-angular-theme.class';
import { joinKeys, appendCustomClasses } from '../../../assets/helpers';
import { AmplifyService, AuthState } from '../../../providers';


const template = `
<div class={{amplifyUI.formSection}} *ngIf="_show">
  <div class={{amplifyUI.sectionHeader}}>Reset your password
    <br />
    <div *ngIf="!code_sent" class={{amplifyUI.hint}}>You will receive a verification code</div>
    <div *ngIf="code_sent">Enter the code you received and set a new password</div>
  </div>
  <div class={{amplifyUI.sectionBody}}>
    <div class={{amplifyUI.formField}}  *ngIf="!code_sent">
      <div class={{amplifyUI.inputLabel}}>Username * </div>
      <input
        (keyup)="setUsername($event.target.value)"
        class={{amplifyUI.input}}
        type="text"
        placeholder="Username"
        [value]="username"
      />
    </div>
    <div class={{amplifyUI.formField}} *ngIf="code_sent">
      <label class={{amplifyUI.inputLabel}}>Code * </label>
      <input #code
        (keyup)="setCode(code.value)"
        class="amplify-form-input"
        type="text"
        placeholder="Enter code"
      />
    </div>
    <div class={{amplifyUI.formField}} *ngIf="code_sent">
      <label class={{amplifyUI.inputLabel}}>Password * </label>
      <input #password
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSubmit()"
        class="amplify-form-input"
        type="password"
        placeholder="Password"
      />
    </div>
    <div class={{amplifyUI.sectionFooter}}>
      <span class={{amplifyUI.sectionFooterPrimaryContent}}>
        <button *ngIf="!code_sent" class={{amplifyUI.button}} (click)="onSend()">Submit</button>
        <button *ngIf="code_sent" class={{amplifyUI.button}} (click)="onSubmit()">Verify</button>
      </span>
      <span class={{amplifyUI.sectionFooterSecondaryContent}}>
        <a *ngIf="code_sent" class={{amplifyUI.a}} (click)="onSend()">Resend Code</a>
        <a *ngIf="!code_sent" class={{amplifyUI.a}} (click)="onSignIn()">Back to Sign in</a>
      </span>
    </div>
    <div class="amplify-alert" *ngIf="errorMessage">
      <div class="amplify-alert-body">
        <span class="amplify-alert-icon">&#9888;</span>
        <div class="amplify-alert-message">{{ errorMessage }}</div>
        <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
      </div>
>>>>>>> initial commit
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
<<<<<<< HEAD
  _usernameAttributes: string = 'username';
=======
>>>>>>> initial commit
  username: string;
  code: string;
  password: string;
  errorMessage: string;
  code_sent = false;
<<<<<<< HEAD
  protected logger: any;
  local_phone_number: string;
  country_code: string = '1';
  email: string;

  constructor(@Inject(AmplifyService) protected amplifyService: AmplifyService) {
    this.logger = this.amplifyService.logger('ForgotPasswordComponent');
=======
  amplifyService: AmplifyService;
  amplifyUI: AmplifyUI;
  private _forgotPasswordConfig: any;
  private _customCSS: any;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.amplifyUI = Object.assign({}, AmplifyUI);
    this._customCSS = {};
    this._forgotPasswordConfig = {};
>>>>>>> initial commit
  }

  @Input()
  set data(data: any) {
    this._authState = data.authState;
    this._show = data.authState.state === 'forgotPassword';
<<<<<<< HEAD
    this._usernameAttributes = data.usernameAttributes;
    this.hide = data.hide ? data.hide : this.hide;

    this.username = (data.authState.user &&
       data.authState.user.username) ?
       data.authState.user.username : '';
  }

  @Input() hide: string[] = [];

  shouldHide(comp) {
    return this.hide.filter(item => item === comp)
            .length > 0;
=======
    this.username = data.authState.user? data.authState.user.username || '' : '';
    if (data.forgotPasswordConfig) {
      this._forgotPasswordConfig = data.forgotPasswordConfig;
    }
    if (data.customCSS) {
      this._customCSS = data.customCSS;
    }
>>>>>>> initial commit
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = authState.state === 'forgotPassword';

    this.email = (authState.user && authState.user.email)? authState.user.email : '';
    this.country_code = (authState.user && authState.user.contry_code) ? authState.user.country_code : '1';
    this.local_phone_number = (authState.user && authState.user.local_phone_number) ? authState.user.local_phone_number : '';
    this.username = (authState.user && authState.user.username) ? authState.user.username : '';
  }

  ngOnInit() {
    if (!this.amplifyService.auth()){
      throw new Error('Auth module not registered on AmplifyService provider');
    }
  }

  @Input()
<<<<<<< HEAD
  set usernameAttributes(usernameAttributes: string) {
    this._usernameAttributes = usernameAttributes;
=======
  set forgotPasswordConfig(forgotPasswordConfig: any) {
    this._forgotPasswordConfig = forgotPasswordConfig;
  }

  @Input()
  set customCSS(customCSS: AmplifyUIInterface) {
    this._customCSS = customCSS;
  }

  ngOnInit() {
    if ((this._forgotPasswordConfig && this._forgotPasswordConfig.customCSS) || this._customCSS) {
      const allClasses = {
        ...this._customCSS,
        forgotPasswordConfig: this._forgotPasswordConfig && this._forgotPasswordConfig.customCSS ? 
        this._forgotPasswordConfig.customCSS : {}
      };
      this._customCSS = joinKeys(allClasses, 'forgotPasswordConfig') as AmplifyUIInterface;
      this.amplifyUI = appendCustomClasses(this.amplifyUI, this._customCSS);
    }
  }

  setUsername(username: string) {
    this.username = username;
>>>>>>> initial commit
  }

  setCode(code: string) {
    this.code = code;
  }

  setPassword(password: string) {
    this.password = password;
  }

  getforgotPwUsername() {
    switch(this._usernameAttributes) {
      case UsernameAttributes.EMAIL:
        return this.email;
      case UsernameAttributes.PHONE_NUMBER:
        return composePhoneNumber(this.country_code, this.local_phone_number);
      default:
        return this.username;
    }
  }

  onSend() {
    let forgotPwUsername = this.getforgotPwUsername();
    if (!forgotPwUsername) {
      this.errorMessage = "Username cannot be empty";
      return;
    }
    this.amplifyService.auth().forgotPassword(forgotPwUsername)
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
        this.getforgotPwUsername(),
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
  
  getUsernameLabel() {
    return labelMap[this._usernameAttributes as string] || this._usernameAttributes;
  }

  onUsernameFieldChanged(event: UsernameFieldOutput) {
    this.email = event.email || this.email;
    this.username = event.username || this.username;
    this.country_code = event.country_code || this.country_code;
    this.local_phone_number = event.local_phone_number || this.local_phone_number;
  }
}
