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

import { Component, Input, OnInit } from '@angular/core';
import * as AmplifyUI from '@aws-amplify/ui';
import { AmplifyUIInterface } from '../../../assets/amplify-angular-theme.class';
import { joinKeys, appendCustomClasses } from '../../../assets/helpers';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';


const template = `
<div class={{amplifyUI.formSection}} *ngIf="_show">
  <div class={{amplifyUI.sectionHeader}}>Confirm Sign Up</div>
  <div class={{amplifyUI.sectionBody}}>
    <div class={{amplifyUI.formField}}>
      <div class={{amplifyUI.inputLabel}}> Username * </div>
      <input
        #amplifyUsername
        class={{amplifyUI.input}}
        type="text"
        disabled
        placeholder="Username"
        [value]="username"
      />
    </div>
    <div class={{amplifyUI.formField}}>
      <div class={{amplifyUI.inputLabel}}> Confirmation Code * </div>
      <input
        #code
        (change)="setCode(code.value)"
        (keyup)="setCode(code.value)"
        (keyup.enter)="onConfirm()"
        class={{amplifyUI.input}}
        type="text"
        placeholder="Enter your Code"
      />
      <div class={{amplifyUI.hint}}>
        Lost your code?
        <a class={{amplifyUI.a}} (click)="onResend()">
          Resend Code
        </a>
      </div>
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
      <a class="amplify-alert-close" (click)="onAlertClose()">&times;</a>
    </div>
  </div>
</div>
`;

@Component({
  selector: 'amplify-auth-confirm-sign-up-core',
  template
})

export class ConfirmSignUpComponentCore implements OnInit {
  _authState: AuthState;
  _show: boolean;
  username: string;
  code: string;
  errorMessage: string;
  amplifyService: AmplifyService;
  amplifyUI: AmplifyUI;
  private _confirmSignUpConfig: any;
  private _customCSS: any;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.amplifyUI = Object.assign({}, AmplifyUI);
    this._customCSS = {};
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
    if (data.customCSS) {
      this._customCSS = data.customCSS;
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
  set customCSS(customCSS: AmplifyUIInterface) {
    this._customCSS = customCSS;
  }

  ngOnInit() {
    if ((this._confirmSignUpConfig && this._confirmSignUpConfig.customCSS) || this._customCSS) {
      const allClasses = {
        ...this._customCSS,
        confirmSignUpConfig: this._confirmSignUpConfig && this._confirmSignUpConfig.customCSS ? 
        this._confirmSignUpConfig.customCSS : {}
      };
      this._customCSS = joinKeys(allClasses, 'confirmSignUpConfig') as AmplifyUIInterface;
      this.amplifyUI = appendCustomClasses(this.amplifyUI, this._customCSS);
    }
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
