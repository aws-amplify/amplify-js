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
  amplifyService: AmplifyService;
  amplifyUI: AmplifyUI;
  private _forgotPasswordConfig: any;
  private _customCSS: any;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.amplifyUI = Object.assign({}, AmplifyUI);
    this._customCSS = {};
    this._forgotPasswordConfig = {};
  }

  @Input()
  set data(data: any) {
    this._authState = data.authState;
    this._show = data.authState.state === 'forgotPassword';
    this.username = data.authState.user? data.authState.user.username || '' : '';
    if (data.forgotPasswordConfig) {
      this._forgotPasswordConfig = data.forgotPasswordConfig;
    }
    if (data.customCSS) {
      this._customCSS = data.customCSS;
    }
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = authState.state === 'forgotPassword';

    this.username = authState.user? authState.user.username || '' : '';
  }

  @Input()
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
