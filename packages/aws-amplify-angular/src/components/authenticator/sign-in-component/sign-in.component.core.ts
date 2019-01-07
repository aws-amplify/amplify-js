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
  amplifyService: AmplifyService;
  amplifyUI: AmplifyUI;
  private _signInConfig: any;
  private _customCSS: any;

  constructor(amplifyService: AmplifyService) {
    this.amplifyService = amplifyService;
    this.amplifyUI = Object.assign({}, AmplifyUI);
    this._customCSS = {};
  }

  @Input()
  set authState(authState: AuthState) {
    this._authState = authState;
    this._show = includes(['signIn', 'signedOut', 'signedUp'], authState.state);
    this.username = authState.user? authState.user.username || '' : '';
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
    const user = this.username? { username: this.username } : null;
    this.amplifyService.setAuthState({ state: 'forgotPassword', user });
  }

  onSignUp() {
    const user = this.username? { username: this.username } : null;
    this.amplifyService.setAuthState({ state: 'signUp', user });
  }

  _setError(err) {
    if (!err) {
      this.errorMessage = null;
      return;
    }

    this.errorMessage = err.message || err;
  }
}
