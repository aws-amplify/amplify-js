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

import { Component, Input, Inject } from '@angular/core';
import { AmplifyService } from '../../../providers/amplify.service';
import { AuthState } from '../../../providers/auth.state';
import { SignInComponentCore } from './sign-in.component.core';
import { auth } from '../../../assets/data-test-attributes';

const template = `
<div
  class="amplify-authenticator"
  *ngIf="_show"
  data-test="${auth.signIn.section}"
  >
  <div class="amplify-form-body" data-test="${auth.signIn.bodySection}">
    <div class="amplify-form-header" data-test="${auth.signIn.headerSection}">
      {{ this.amplifyService.i18n().get('Sign in to your account') }}
    </div>
    <ion-list lines="none">
      <amplify-auth-username-field-ionic
        [usernameAttributes]="_usernameAttributes"
        (usernameFieldChanged)="onUsernameFieldChanged($event)"
      ></amplify-auth-username-field-ionic>
      <ion-item lines="none">
        <ion-label class="amplify-input-label" for="password" position="stacked">
          {{ this.amplifyService.i18n().get('Password *') }}
        </ion-label>
        <ion-input
          #password
          type="password"
          class="amplify-form-input"
          (input)="setPassword(password.value)"
          (keyup.enter)="onSignIn()"
          data-test="${auth.signIn.passwordInput}"
        ></ion-input>
      </ion-item>
    </ion-list>
    <div class="amplify-form-actions">
      <div class="amplify-form-row">
        <ion-button expand="block" color="primary"
          (click)="onSignIn()"
          data-test="${auth.signIn.signInButton}"
          >{{ this.amplifyService.i18n().get('Sign In') }}</ion-button>
      </div>

      <div class="amplify-form-row">
        <div class="amplify-form-signup" *ngIf="!shouldHide('SignUp')">
          {{ this.amplifyService.i18n().get('No account?') }}
          <a
            class="amplify-form-link"
            (click)="onSignUp()"
            data-test="${auth.signIn.createAccountLink}"
            >
            {{ this.amplifyService.i18n().get('Create account') }}
          </a>
        </div>
        <div class="amplify-form-signup" *ngIf="!shouldHide('ForgotPassword')">
          <a class="amplify-form-link" (click)="onForgotPassword()" data-test="${auth.signIn.forgotPasswordLink}">
            {{ this.amplifyService.i18n().get('Reset Password') }}
          </a>
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
	selector: 'amplify-auth-sign-in-ionic',
	template,
})
export class SignInComponentIonic extends SignInComponentCore {
	constructor(@Inject(AmplifyService) public amplifyService: AmplifyService) {
		super(amplifyService);
	}
}
