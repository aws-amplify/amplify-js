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
import { ForgotPasswordComponentCore } from './forgot-password.component.core';
import { includes } from '../common';
import {usernameFieldTemplate, emailFieldTemplate, phoneNumberFieldTemplate} from '../ionic-templates';

const template = `
<div class="amplify-authenticator amplify-authenticator-ionic" *ngIf="_show">
  <div class="amplify-form-body">
  <div class="amplify-form-header amplify-form-header-ionic">{{ this.amplifyService.i18n().get('Reset your password') }}</div>
  <div class="amplify-form-text" *ngIf="!code_sent">{{ this.amplifyService.i18n().get('You will receive a verification code to reset your password') }}</div>

  <ion-list>

    <ion-item lines="none" *ngIf="!code_sent">
     <div *ngIf="this._usernameAttributes === 'email'">` +
        emailFieldTemplate + 
      `</div>
      <div *ngIf="this._usernameAttributes === 'phone_number'">` +
        phoneNumberFieldTemplate +
      `</div>
      <div *ngIf="this._usernameAttributes !== 'email' && this._usernameAttributes !== 'phone_number'">` + 
        usernameFieldTemplate + 
      `</div>
    </ion-item>

    <ion-item lines="none" *ngIf="code_sent">
      <ion-label class="amplify-input-label amplify-input-label-ionic" position="stacked">{{ this.amplifyService.i18n().get('Code *') }}</ion-label>
      <ion-input
        #code
        type="text"
        class="amplify-form-input"
        (keyup)="setCode(code.value)"
      ></ion-input>
    </ion-item>

    <ion-item lines="none" *ngIf="code_sent">
      <ion-label class="amplify-input-label amplify-input-label-ionic" position="stacked">{{ this.amplifyService.i18n().get('Password *') }}</ion-label>
      <ion-input
        #password
        type="password"
        class="amplify-form-input"
        (keyup)="setPassword(password.value)"
        (keyup.enter)="onSubmit()"
      ></ion-input>
    </ion-item>

  </ion-list>
  <div class="amplify-form-actions">
    <div>
      <ion-button expand="block" color="primary"
        (click)="onSend()"
        *ngIf="!code_sent"
      >{{ this.amplifyService.i18n().get('Submit') }}</ion-button>
      <ion-button expand="block" color="primary"
      *ngIf="code_sent"
      (click)="onSubmit()"
      >{{ this.amplifyService.i18n().get('Verify') }}</ion-button>
    </div>
    <div class="amplify-form-row">
      <div class="amplify-form-signup">{{ this.amplifyService.i18n().get('Have an account?') }} <a class="amplify-form-link" (click)="onSignIn()">{{ this.amplifyService.i18n().get('Sign In') }}</a></div>
      <div class="amplify-form-signup">{{ this.amplifyService.i18n().get('Lost your code?') }} <a class="amplify-form-link" (click)="onSend()">{{ this.amplifyService.i18n().get('Resend') }}</a></div>
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
  selector: 'amplify-auth-forgot-password-ionic',
  template
})
export class ForgotPasswordComponentIonic extends ForgotPasswordComponentCore {
  constructor(amplifyService: AmplifyService) {
    super(amplifyService);
  }

  onCodeChange(val) {
    this.country_code = val;
  }

  onNumberChange(val) {
    this.local_phone_number = val;
  }

  setUsername(username: string) {
    this.username = username;
  }

  setEmail(email: string) {
    this.email = email;
  }
}
