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
import { auth } from '../../../assets/data-test-attributes';

const template = `
<div class="amplify-container" *ngIf="_show">
  <div class="amplify-form-container" data-test="${auth.confirmSignIn.section}">
    <div class="amplify-form-body" data-test="${auth.confirmSignIn.bodySection}">
    <div class="amplify-form-header" data-test="${auth.confirmSignIn.headerSection}">{{ this.amplifyService.i18n().get('Confirm Sign in') }}</div>
      <div class="amplify-form-row" *ngIf="!shouldHide('SignIn')">
        <label class="amplify-input-label" for="code">
          {{ this.amplifyService.i18n().get('Confirmation Code *') }}
        </label>
        <input #code
          (change)="setCode(code.value)"
          (keyup)="setCode(code.value)"
          (keyup.enter)="onConfirm()"
          class="amplify-form-input"
          type="text"
          placeholder="{{ this.amplifyService.i18n().get('Enter your Code') }}"
          data-test="${auth.confirmSignIn.codeInput}"
        />
      </div>
      <div class="amplify-form-actions">
        <div class="amplify-form-cell-left">
          <div class="amplify-form-actions-left">
            <a 
              class="amplify-form-link"
              (click)="onSignIn()"
              data-test="${auth.confirmSignIn.backToSignInLink}"
              >
                {{ this.amplifyService.i18n().get('Back to Sign in') }}
            </a>
          </div>
        </div>
        <div class="amplify-form-cell-right">
          <button
            class="amplify-form-button"
            data-test="${auth.confirmSignIn.confirmButton}"
            (click)="onConfirm()"
            >
              {{ this.amplifyService.i18n().get('Confirm') }}</button>
        </div>
      </div>
      </div>
  </div>
  <div class="amplify-alert" *ngIf="errorMessage">
    <div class="amplify-alert-body">
      <span class="amplify-alert-icon">&#9888;</span>
      <div class="amplify-alert-message">{{ this.amplifyService.i18n().get(errorMessage) }}</div>
=======
import { Component, Input, OnInit } from '@angular/core';
import * as AmplifyUI from '@aws-amplify/ui';
import { AmplifyUIInterface } from '../../../assets/amplify-angular-theme.class';
import { joinKeys, appendCustomClasses } from '../../../assets/helpers';
import { AmplifyService, AuthState } from '../../../providers';

const template = `
<div class={{amplifyUI.formSection}} *ngIf="_show">
  <div class={{amplifyUI.sectionHeader}}>Confirm Sign in</div>
  <div class={{amplifyUI.sectionBody}}>
    <div class={{amplifyUI.formField}}>
      <div class={{amplifyUI.inputLabel}}> Confirmation Code *</div>
      <input #code
        (change)="setCode(code.value)"
        (keyup)="setCode(code.value)"
        (keyup.enter)="onConfirm()"
        class={{amplifyUI.input}}
        type="text"
        placeholder="Enter your Code"
      />
    </div>

    <div class={{amplifyUI.sectionFooter}}>
      <span class={{amplifyUI.sectionFooterPrimaryContent}}>
        <a class={{amplifyUI.a}} (click)="onSignIn()">Back to Sign in</a>
      </span>
      <span class={{amplifyUI.sectionFooterSecondaryContent}}>
        <button class={{amplifyUI.button}} (click)="onConfirm()">
          Confirm
        </button>
      </span>
    </div>
  </div>
  <div class="amplify-alert"  *ngIf="errorMessage">
    <div class="amplify-alert-body">
      <span class="amplify-alert-icon">&#9888;</span>
      <div class="amplify-alert-message">{{ errorMessage }}</div>
>>>>>>> initial commit
      <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
    </div>
  </div>
</div>
`;

@Component({
  selector: 'amplify-auth-confirm-sign-in-core',
  template
})
export class ConfirmSignInComponentCore implements OnInit {
  _authState: AuthState;
  _show: boolean;
  code: string;
  errorMessage: string;
<<<<<<< HEAD
  protected logger: any;

  constructor(@Inject(AmplifyService) protected amplifyService: AmplifyService) {
    this.logger = this.amplifyService.logger('ConfiSignInComponent');
=======
  amplifyService: AmplifyService;
  amplifyUI: AmplifyUI;
  private _confirmSignInConfig: any;
  private _customCSS: any;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.amplifyUI = Object.assign({}, AmplifyUI);
    this._customCSS = {};
    this._confirmSignInConfig = {};
>>>>>>> initial commit
  }

  @Input()
  set data(data: any) {
    this.hide = data.hide ? data.hide : this.hide;
    this._authState = data.authState;
    this._show = data.authState.state === 'confirmSignIn';
    if (data.confirmSignInConfig) {
      this._confirmSignInConfig = data.confirmSignInConfig;
    }
    if (data.customCSS) {
      this._customCSS = data.customCSS;
    }
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = authState.state === 'confirmSignIn';
  }

<<<<<<< HEAD
  @Input() hide: string[] = [];

  ngOnInit() {
    if (!this.amplifyService.auth()){
      throw new Error('Auth module not registered on AmplifyService provider');
    }
  }

  shouldHide(comp) {
    return this.hide.filter(item => item === comp)
            .length > 0;
=======
  @Input()
  set confirmSignInConfig(confirmSignInConfig: any) {
    this._confirmSignInConfig = confirmSignInConfig;
  }

  @Input()
  set customCSS(customCSS: AmplifyUIInterface) {
    this._customCSS = customCSS;
  }

  ngOnInit() {
    if ((this._confirmSignInConfig && this._confirmSignInConfig.customCSS) || this._customCSS) {
      const allClasses = {
        ...this._customCSS,
        confirmSignInConfig: this._confirmSignInConfig && this._confirmSignInConfig.customCSS ? 
        this._confirmSignInConfig.customCSS : {}
      };
      this._customCSS = joinKeys(allClasses, 'confirmSignInConfig') as AmplifyUIInterface;
      this.amplifyUI = appendCustomClasses(this.amplifyUI, this._customCSS);
    }
>>>>>>> initial commit
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
        this.onAlertClose();
        this.amplifyService.setAuthState({ state: 'signedIn', user });
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
